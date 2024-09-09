import { getCurrentDocumentVersion } from '../../db/collections';
import {
  Collections,
  DatabaseConnection,
} from '../../eventSourcing/eventSourcingEventsSchema';
import { PlayerResource, UpdatePlayerNamePayload } from '../playersSchema';

export const updatePlayerName = async (
  { _id, name }: UpdatePlayerNamePayload,
  dbConnection: DatabaseConnection,
  collections: Collections,
): Promise<void> => {
  const { playersCollection } = collections;
  const { db } = dbConnection;
  if (_id !== '' && name !== undefined && name !== '') {
    try {
      //@todo update player in season -> tournament -> team
      await db.collection<PlayerResource>(playersCollection).updateOne(
        {
          _id,
        },
        {
          $set: {
            name,
            updated: new Date().getTime(),
            version: getCurrentDocumentVersion().players,
          },
        },
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  } else {
    throw Error('Name and id need to be defined');
  }
};
