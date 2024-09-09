import { getCurrentDocumentVersion } from '../../db/collections';
import {
  Collections,
  DatabaseConnection,
} from '../../eventSourcing/eventSourcingEventsSchema';
import { PlayerDeletedPayload, PlayerResource } from '../playersSchema';

export const removePlayer = async (
  { _id }: PlayerDeletedPayload,
  dbConnection: DatabaseConnection,
  collections: Collections,
): Promise<void> => {
  const { playersCollection } = collections;
  const { db } = dbConnection;
  if (_id !== '') {
    try {
      await db.collection<PlayerResource>(playersCollection).updateOne(
        {
          _id,
        },
        {
          $set: {
            deleted: new Date().getTime(),
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
    throw Error('PlayerId needs to be defined');
  }
};
