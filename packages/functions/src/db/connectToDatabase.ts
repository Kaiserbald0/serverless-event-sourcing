import * as mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient
let cachedDb: mongodb.Db | null = null
export const connectToDatabase = async (): Promise<mongodb.Db> => {
  if (cachedDb !== null) {
    return cachedDb
  }
  if (process.env.MONGODB_URI === undefined) {
    throw Error('Define a connection string')
  }
  if (process.env.MONGODB_DB_NAME === undefined) {
    throw Error('Define a db')
  }
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  cachedDb = client.db(process.env.MONGODB_DB_NAME)
  return cachedDb
}
