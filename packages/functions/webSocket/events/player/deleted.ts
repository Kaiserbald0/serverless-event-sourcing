import { type APIGatewayProxyHandler } from 'aws-lambda';
import { EventManager } from '@event-sourcing-demo/core/eventManager/eventManager';
import {
  PlayerDeletedPayload,
  PlayerEventType,
} from '@event-sourcing-demo/core/players/playersSchema';

const DEBUG = 0;

export const main: APIGatewayProxyHandler = async (event, context) => {
  if (DEBUG > 0) {
    console.log('[WSAPI HANDLER] PlayerDeleted');
  }
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    if (!event.body) {
      throw Error('missing event body');
    }
    const body = JSON.parse(event.body);
    const eventPayload = {
      _id: body.payload._id,
    };
    EventManager.injestEvent<PlayerDeletedPayload>({
      eventType: PlayerEventType.PlayerDeleted,
      eventPayload,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ result: 'success' }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};
