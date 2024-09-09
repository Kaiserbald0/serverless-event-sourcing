import { getCurrentDocumentVersion } from '../../db/collections';
import {
  Collections,
  DatabaseConnection,
} from '../../eventSourcing/eventSourcingEventsSchema';
import {
  PlayerResource,
  UpdatePlayerRolePayloadSchema,
} from '../playersSchema';

export const updatePlayerRole = async (
  { _id, role }: UpdatePlayerRolePayloadSchema,
  dbConnection: DatabaseConnection,
  collections: Collections,
): Promise<void> => {
  const { playersCollection } = collections;
  const { db } = dbConnection;
  if (_id !== '' && role !== undefined) {
    try {
      await db.collection<PlayerResource>(playersCollection).updateOne(
        {
          _id,
        },
        {
          $set: {
            role,
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
    throw Error('Name and role need to be defined');
  }
};
