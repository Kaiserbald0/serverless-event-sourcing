import { type APIGatewayProxyHandler } from 'aws-lambda';
import { EventManager } from '@event-sourcing-demo/core/eventManager/eventManager';
import {
  PlayerEventType,
  UpdatePlayerRolePayloadSchema,
} from '@event-sourcing-demo/core/players/playersSchema';

const DEBUG = 0;

export const main: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (DEBUG > 0) {
    console.log('[WSAPI HANDLER] PlayerAssociationUpdated');
  }
  try {
    if (!event.body) {
      throw Error('missing event body');
    }
    const body = JSON.parse(event.body);
    const eventPayload = {
      _id: body.payload.id,
      role: body.payload.role,
    };
    EventManager.injestEvent<UpdatePlayerRolePayloadSchema>({
      eventType: PlayerEventType.PlayerRoleUpdated,
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
