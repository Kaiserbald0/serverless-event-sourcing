import { getCurrentDocumentVersion } from '../../db/collections';
import {
  Collections,
  DatabaseConnection,
} from '../../eventSourcing/eventSourcingEventsSchema';
import { CreatePlayerPayload, PlayerResource } from '../playersSchema';

export const createPlayer = async (
  { _id, name, role }: CreatePlayerPayload,
  dbConnection: DatabaseConnection,
  collections: Collections,
): Promise<void> => {
  const { playersCollection } = collections;
  const { db } = dbConnection;
  //@todo check for other values after reset
  if (name !== undefined && role !== undefined) {
    const playerToAdd: PlayerResource = {
      _id,
      name,
      role,
      created: new Date().getTime(),
      updated: new Date().getTime(),
      version: getCurrentDocumentVersion().players,
    };
    try {
      await db
        .collection<PlayerResource>(playersCollection)
        .insertOne(playerToAdd);
    } catch (e) {
      console.error(e);
      throw e;
    }
  } else {
    throw Error('Name and role need to be defined');
  }
};
