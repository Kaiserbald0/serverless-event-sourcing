import { type APIGatewayProxyHandler } from 'aws-lambda';
import { EventManager } from '@event-sourcing-demo/core/eventManager/eventManager';
import {
  PlayerEventType,
  UpdatePlayerNamePayload,
} from '@event-sourcing-demo/core/players/playersSchema';

const DEBUG = 0;

export const main: APIGatewayProxyHandler = async (event, context) => {
  if (DEBUG > 0) {
    console.log('[WSAPI HANDLER] playerNameUpdated');
  }
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    if (!event.body) {
      throw Error('missing event body');
    }
    const body = JSON.parse(event.body);
    const eventPayload = {
      _id: body.payload.id,
      name: body.payload.name,
    };
    EventManager.injestEvent<UpdatePlayerNamePayload>({
      eventType: PlayerEventType.PlayerNameUpdated,
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
