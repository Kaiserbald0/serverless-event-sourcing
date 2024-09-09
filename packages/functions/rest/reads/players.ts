import {
  type APIGatewayProxyEventV2,
  type APIGatewayProxyResult,
  type Context,
} from 'aws-lambda';
import { connectToDatabase } from '@event-sourcing-demo/core/db/connectToDatabase';
import { Player } from '@event-sourcing-demo/core/players/player';

export async function main(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false;
  const dbConnection = await connectToDatabase();
  try {
    if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
      throw Error('Define player collection');
    }
    console.log(`ROUTE -------> ${event.requestContext.routeKey}`);
    switch (event.requestContext.routeKey) {
      case 'GET /players': {
        const players = await Player.list(
          dbConnection.db,
          process.env.MONGODB_PLAYERS_COLLECTION_NAME,
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ players }),
        };
      }

      default: {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Route not found' }),
        };
      }
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e),
    };
  }
}
