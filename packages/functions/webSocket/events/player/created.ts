import { type APIGatewayProxyHandler } from 'aws-lambda';
import { v4 } from 'uuid';
import { EventManager } from '@event-sourcing-demo/core/eventManager/eventManager';
import {
  CreatePlayerPayload,
  PlayerEventType,
} from '@event-sourcing-demo/core/players/playersSchema';

const DEBUG = 0;

export const main: APIGatewayProxyHandler = async (event, context) => {
  if (DEBUG > 0) {
    console.log('[WSAPI HANDLER] PlayerCreated');
  }
  if (!process.env.PLAYERS_DOCUMENT_CURRENT_VERSION) {
    throw Error('PLAYERS_DOCUMENT_CURRENT_VERSION not set');
  }
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    if (!event.body) {
      throw Error('missing event body');
    }
    const body = JSON.parse(event.body);
    const eventPayload = {
      _id: v4(),
      name: body.payload.name,
      role: body.payload.role,
      version: parseInt(process.env.PLAYERS_DOCUMENT_CURRENT_VERSION),
    };
    EventManager.injestEvent<CreatePlayerPayload>({
      eventType: PlayerEventType.PlayerCreated,
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
