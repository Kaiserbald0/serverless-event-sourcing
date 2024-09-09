import {
  type APIGatewayProxyEventV2,
  type APIGatewayProxyResult,
  type Context,
} from 'aws-lambda';
import { connectToDatabase } from '@event-sourcing-demo/core/db/connectToDatabase';

export async function main(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false;
  const dbConnection = await connectToDatabase();

  const eType = event.queryStringParameters?.eventType
    ? event.queryStringParameters.eventType.split(',')
    : [];

  const eState = event.queryStringParameters?.eventState
    ? event.queryStringParameters.eventState.split(',')
    : [];

  const query: {
    eventType?: { $in: string[] };
    eventState?: { $in: string[] };
  } = {};

  if (eType.length > 0) {
    query.eventType = { $in: eType };
  }

  if (eState.length > 0) {
    query.eventState = { $in: eState };
  }

  try {
    if (
      process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME === undefined
    ) {
      throw Error('Define player collection');
    }
    const events = await dbConnection.db
      .collection(process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME)
      .find(query)
      .sort({
        eventDate: -1,
      })
      .limit(25)
      .toArray();
    return {
      statusCode: 200,
      body: JSON.stringify({ events }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
}
