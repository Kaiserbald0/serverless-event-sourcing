import { type Db } from 'mongodb';
import { PlayerResource } from '../playersSchema';

export const listPlayers = async (
  db: Db,
  playersCollection: string,
): Promise<PlayerResource[]> => {
  try {
    return await db
      .collection<PlayerResource>(playersCollection)
      .find({ deleted: undefined })
      .toArray();
  } catch (e) {
    console.error(e);
    throw e;
  }
};
