import { EventBridgeEventDetail } from '@event-sourcing-demo/core/eventManager/schema';
import { ResultEvent } from '@event-sourcing-demo/core/eventSourcing/eventSourcingEventsSchema';
import { postMessage } from '@event-sourcing-demo/core/ws/postMessage';

const DEBUG_LEVEL = 0;

export async function main(
  eventReceived: EventBridgeEventDetail<{ event: ResultEvent }>,
): Promise<void> {
  if (DEBUG_LEVEL > 0) {
    console.log('EVENT BUS 2 - event received');
  }
  const { detail } = eventReceived;
  await postMessage({
    eventType: detail.event.eventParsed.eventType,
    message: detail.event.message,
    error: detail.event.error,
  });
  if (DEBUG_LEVEL > 0) {
    console.log('EVENT BUS 2 - event sent to client');
  }
}
