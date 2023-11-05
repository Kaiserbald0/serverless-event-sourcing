import { type Context, type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { connectToDatabase } from 'src/db/connectToDatabase'

export async function main (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false
  const db = await connectToDatabase()
  try {
    if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
      throw Error('Define player collection')
    }
    const roles = await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).distinct('playerRole')
    return {
      statusCode: 200,
      body: JSON.stringify({ roles })
    }
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify(e)
    }
  }
}
