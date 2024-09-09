import { EventBus } from 'sst/node/event-bus';
import { v4 } from 'uuid';
import { getCollections } from '../db/collections';
import { connectToDatabase } from '../db/connectToDatabase';
import { EventSourcing } from '../eventSourcing/eventSourcing';
import {
  EventState,
  EventTypes,
  SourceEvent,
} from '../eventSourcing/eventSourcingEventsSchema';
import { EventManager } from './eventManager';

const DEBUG_LEVEL = 0;

export const injestEvent = async <TInput>({
  eventType,
  eventPayload,
}: {
  eventType: EventTypes;
  eventPayload: TInput;
}): Promise<void> => {
  if (process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME === undefined) {
    throw Error('Define eventsourcing collection');
  }
  const { db } = await connectToDatabase();
  const eventsCollection =
    process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME;
  if (DEBUG_LEVEL > 0) {
    console.log('[Injesting event] Event type', eventType);
  }
  const eventObject: SourceEvent = {
    eventId: v4(),
    eventType,
    eventPayload: JSON.stringify(eventPayload),
    eventDate: new Date().getTime(),
    eventState: EventState.PENDING,
  };
  if (DEBUG_LEVEL > 1) {
    console.log('[Injesting event] Event object', eventObject);
  }
  try {
    await EventSourcing.storeCommand({
      eventObject,
      db,
      eventSourcingCollection: eventsCollection,
    });
    await EventManager.publishEventToEventBus({
      eventObject,
      eventBusName: EventBus.MainEventBus.eventBusName,
    });
  } catch (e) {
    console.error(`Injesting event`, e);
  }
};
