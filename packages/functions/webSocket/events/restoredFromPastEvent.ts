import { type APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { EventBus } from 'sst/node/event-bus';
import { TimeTravelEventType } from '@event-sourcing-demo/core/eventSourcing/eventSourcingEventsSchema';

const DEBUG = 0;

const client = new AWS.EventBridge();

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

    await client
      .putEvents({
        Entries: [
          {
            EventBusName: EventBus.MainEventBus.eventBusName,
            Source: 'eventSourcing.publishCommand',
            DetailType: TimeTravelEventType.RestoredFromPastEvent,
            Detail: JSON.stringify({
              event: {
                eventType: TimeTravelEventType.RestoredFromPastEvent,
                eventPayload: JSON.stringify({ eventId: body.payload.eventId }),
              },
            }),
          },
        ],
      })
      .promise();

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
