import { EventBus } from 'sst/node/event-bus';
import { getCollections } from '../db/collections';
import { connectToDatabase } from '../db/connectToDatabase';
import { EventSourcing } from '../eventSourcing/eventSourcing';
import {
  Collections,
  DatabaseConnection,
  ResultEventType,
  SourceEventResource,
} from '../eventSourcing/eventSourcingEventsSchema';
import { EventManager } from './eventManager';

const DEBUG_LEVEL = 0;

export const processEventBridgeEvent = async <TInput>({
  eventObject,
  parsingFuncion,
}: {
  eventObject: SourceEventResource;
  parsingFuncion: (
    input: TInput,
    dbConnection: DatabaseConnection,
    collections: Collections,
  ) => void;
}): Promise<void> => {
  if (process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME === undefined) {
    throw Error('Define eventsourcing collection');
  }

  let parsingResult = 'success';
  let parsingError = null;
  if (DEBUG_LEVEL > 1) {
    console.log(
      `[Process Event Bridge Event] Event received: ${eventObject.eventType}`,
    );
  }
  const dbConnection = await connectToDatabase();
  try {
    await EventSourcing.parsingEvent({
      eventObject,
      db: dbConnection.db,
      eventSourcingCollection:
        process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME,
    });
    await parsingFuncion(
      JSON.parse(eventObject.eventPayload),
      dbConnection,
      getCollections(),
    );
    await EventSourcing.acceptEvent({
      eventObject,
      db: dbConnection.db,
      eventSourcingCollection:
        process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME,
    });
  } catch (e: unknown) {
    console.error(`event parsing error`, e);
    parsingResult = 'error';
    parsingError = e as Error;
    await EventSourcing.rejectEvent({
      eventObject,
      db: dbConnection.db,
      eventSourcingCollection:
        process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME,
      error: e as Error,
    });
  } finally {
    console.log(
      `[Process Event Bridge Event] Post message: ${eventObject.eventType}`,
    );
    await EventManager.publishEventToEventBus({
      eventBusName: EventBus.OutputEventBus.eventBusName,
      eventObject: {
        eventType: ResultEventType.POST_TO_CLIENT,
        eventParsed: eventObject,
        message: parsingResult,
        error: parsingError?.message,
      },
    });
  }
};
