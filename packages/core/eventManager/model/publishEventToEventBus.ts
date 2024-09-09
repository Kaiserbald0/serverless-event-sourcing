import AWS from 'aws-sdk';
import {
  ResultEvent,
  SourceEvent,
} from '../eventSourcing/eventSourcingEventsSchema';

const client = new AWS.EventBridge();
const DEBUG = 0;

export const publishEventToEventBus = async ({
  eventObject,
  eventBusName,
}: {
  eventObject: SourceEvent | ResultEvent;
  eventBusName: string;
}): Promise<void> => {
  const response = await client
    .putEvents({
      Entries: [
        {
          EventBusName: eventBusName,
          Source: 'eventSourcing.publishCommand',
          DetailType: eventObject.eventType,
          Detail: JSON.stringify({ event: eventObject }),
        },
      ],
    })
    .promise();
  if (response.$response.error) {
    throw Error(response.$response.error.message);
  }
  if (DEBUG > 0) {
    console.log(
      '[API HANDLER] Event published to event bus',
      eventBusName,
      eventObject.eventType,
    );
  }
};
