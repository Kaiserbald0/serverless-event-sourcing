import * as mongodb from 'mongodb';
import { type DatabaseConnection } from '../eventSourcing/eventSourcingEventsSchema';

const MongoClient = mongodb.MongoClient;

let cachedClient: mongodb.MongoClient | null = null;
let cachedDb: mongodb.Db | null = null;
export const connectToDatabase = async (): Promise<DatabaseConnection> => {
  if (cachedDb !== null && cachedClient !== null) {
    return { client: cachedClient, db: cachedDb };
  }
  if (process.env.MONGODB_URI === undefined) {
    throw Error('Define a connection string');
  }
  if (process.env.MONGODB_DB_NAME === undefined) {
    throw Error('Define a db');
  }
  cachedClient = await MongoClient.connect(process.env.MONGODB_URI);
  cachedDb = cachedClient.db(process.env.MONGODB_DB_NAME);
  return { client: cachedClient, db: cachedDb };
};
