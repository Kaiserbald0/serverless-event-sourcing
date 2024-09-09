import {
  CollationOptions,
  CreateIndexesOptions,
  IndexSpecification,
} from 'mongodb';
import { Player } from '../../players/player';
import { PlayerEventType } from '../../players/playersSchema';
import {
  CollectionToRebuild,
  Collections,
  DatabaseConnection,
  EventState,
  type SourceEvent,
} from '../eventSourcingEventsSchema';

const DEBUG_LEVEL = 0;

const getCollectionByName = (
  collections: CollectionToRebuild[],
  name: string,
): CollectionToRebuild => {
  const collection = collections.find(c => c.collectionName === name);
  if (!collection) {
    throw new Error(`${name} collection missing`);
  }
  return collection;
};

export const traverseTime = async ({
  eventSourcingCollection,
  eventId,
  collectionsToRebuild,
  dbConnection,
}: {
  eventSourcingCollection: string;
  eventId: string;
  collectionsToRebuild: CollectionToRebuild[];
  dbConnection: DatabaseConnection;
}): Promise<void> => {
  if (DEBUG_LEVEL > 1) {
    console.log('####### Traversing time ############');
    console.log(eventId);
    console.log(eventSourcingCollection);
    console.log(collectionsToRebuild);
    console.log(dbConnection);
  }

  // Aggregation pipeline to get all the events recorded before the evetID and
  // the eventId itself
  const aggregationPipeline = [
    {
      $match: {
        eventId,
      },
    },
    {
      $facet: {
        originalEvent: [
          {
            $project: {
              eventId: 1,
              eventType: 1,
              eventPayload: 1,
              eventDate: 1,
              eventState: 1,
            },
          },
        ],
        eventsAfterSpecificEvent: [
          {
            $lookup: {
              from: eventSourcingCollection,
              let: { specificEventDate: '$eventDate' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $lt: ['$eventDate', '$$specificEventDate'] },
                        { $ne: ['$eventId', eventId] },
                      ],
                    },
                  },
                },
                {
                  $sort: { eventDate: 1 },
                },
                {
                  $project: {
                    _id: 1,
                    eventId: 1,
                    eventType: 1,
                    eventPayload: 1,
                    eventDate: 1,
                    eventState: 1,
                  },
                },
              ],
              as: 'eventsAfterSpecificEvent',
            },
          },
          {
            $unwind: '$eventsAfterSpecificEvent',
          },
          {
            $replaceRoot: { newRoot: '$eventsAfterSpecificEvent' },
          },
          {
            $project: {
              eventId: 1,
              eventType: 1,
              eventPayload: 1,
              eventDate: 1,
              eventState: 1,
            },
          },
          {
            $sort: { eventDate: 1 },
          },
        ],
      },
    },
    {
      $project: {
        combinedResults: {
          $concatArrays: ['$originalEvent', '$eventsAfterSpecificEvent'],
        },
      },
    },
    {
      $unwind: '$combinedResults',
    },
    {
      $replaceRoot: { newRoot: '$combinedResults' },
    },
    {
      $sort: { eventDate: 1 },
    },
  ];
  const { db } = dbConnection;
  const cursor = db
    .collection(eventSourcingCollection)
    .aggregate(aggregationPipeline);
  // build the recovery collection (remove old, create recovery collection and
  // create index)
  console.log('Step 1: Rebuild collection');
  for (let i = 0; i < collectionsToRebuild.length; i++) {
    const collectionToRebuild = collectionsToRebuild[i];
    await db
      .collection(collectionToRebuild.rebuildingCollection)
      .drop()
      .catch(error => {
        if (error.codeName !== 'NamespaceNotFound') {
          throw error;
        }
      });
    for (let j = 0; j < collectionToRebuild.collectionIndexes.length; j++) {
      const index = collectionToRebuild.collectionIndexes[j];
      const indexFields: IndexSpecification = { [index.name]: 1 };
      const indexOptions: CreateIndexesOptions = {};
      if (index.options) {
        index.options?.forEach(option => {
          switch (option.name) {
            case 'unique':
              indexOptions.unique = option.value as boolean;
              break;
            case 'sparse':
              indexOptions.sparse = option.value as boolean;
              break;
            case 'background':
              indexOptions.background = option.value as boolean;
              break;
            case 'expireAfterSeconds':
              indexOptions.expireAfterSeconds = option.value as number;
              break;
            case 'collation':
              indexOptions.collation = option.value as CollationOptions;
              break;
          }
        });
      }
      await db
        .collection(collectionToRebuild.rebuildingCollection)
        .createIndex(indexFields, indexOptions);
    }
  }
  console.log('Step 1 completed');

  console.log('Step 2: Restored data in temp collections');
  const collections: Collections = {
    playersCollection: getCollectionByName(collectionsToRebuild, 'players')
      ?.rebuildingCollection,
  };

  // re insert data into the recovery collection
  while (await cursor.hasNext()) {
    const eventToReplay = (await cursor.next()) as SourceEvent;
    if (
      eventToReplay !== null &&
      eventToReplay.eventState === EventState.ACCEPTED
    ) {
      switch (eventToReplay.eventType) {
        case PlayerEventType.PlayerCreated: {
          await Player.create(
            JSON.parse(eventToReplay.eventPayload),
            dbConnection,
            collections,
          );
          break;
        }
        case PlayerEventType.PlayerNameUpdated: {
          await Player.updateName(
            JSON.parse(eventToReplay.eventPayload),
            dbConnection,
            collections,
          );
          break;
        }
        case PlayerEventType.PlayerRoleUpdated: {
          await Player.updateRole(
            JSON.parse(eventToReplay.eventPayload),
            dbConnection,
            collections,
          );
          break;
        }
        case PlayerEventType.PlayerDeleted: {
          await Player.remove(
            JSON.parse(eventToReplay.eventPayload),
            dbConnection,
            collections,
          );
          break;
        }
      }
    }
  }
  console.log('Step 2 completed');

  console.log('Step 3: Replaced current collection with rebuild');
  // replace current collections with rebuilt collection
  for (let i = 0; i < collectionsToRebuild.length; i++) {
    const collectionToRebuild = collectionsToRebuild[i];
    await db
      .collection(collectionToRebuild.oldCollection)
      .drop()
      .catch(error => {
        if (error.codeName !== 'NamespaceNotFound') {
          throw error;
        }
      });
    await db
      .collection(collectionToRebuild.originalCollection)
      .rename(collectionToRebuild.oldCollection)
      .catch(error => {
        console.log(error.codeName);
        if (error.codeName !== 'NamespaceNotFound') {
          throw error;
        }
      });
    await db
      .collection(collectionToRebuild.rebuildingCollection)
      .rename(collectionToRebuild.originalCollection);
  }

  console.log('Step 3 completed');
};
