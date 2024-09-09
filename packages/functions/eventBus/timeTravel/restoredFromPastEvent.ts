import { EventBus } from 'sst/node/event-bus';
import { connectToDatabase } from '@event-sourcing-demo/core/db/connectToDatabase';
import { EventManager } from '@event-sourcing-demo/core/eventManager/eventManager';
import { EventBridgeEventDetail } from '@event-sourcing-demo/core/eventManager/schema';
import { EventSourcing } from '@event-sourcing-demo/core/eventSourcing/eventSourcing';
import {
  CollectionToRebuild,
  ResultEventType,
  SourceEventResource,
} from '@event-sourcing-demo/core/eventSourcing/eventSourcingEventsSchema';

const DEBUG_LEVEL = 0;

export async function main(
  event: EventBridgeEventDetail<{ event: SourceEventResource }>,
): Promise<void> {
  if (DEBUG_LEVEL > 0) {
    console.log('EVENT BUS - event received');
  }
  if (DEBUG_LEVEL > 1) {
    console.log('event received: ', event);
  }

  if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
    throw Error('Define players collection');
  }
  if (process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME === undefined) {
    throw Error('Define events collection');
  }

  const collectionsToRebuild: CollectionToRebuild[] = [
    {
      collectionName: 'players',
      originalCollection: process.env.MONGODB_PLAYERS_COLLECTION_NAME,
      rebuildingCollection: `${process.env.MONGODB_PLAYERS_COLLECTION_NAME}_rebuilding`,
      oldCollection: `${process.env.MONGODB_PLAYERS_COLLECTION_NAME}_previous`,
      collectionIndexes: [{ name: 'name' }, { name: 'association' }],
    },
  ];

  const dbConnection = await connectToDatabase();

  if (DEBUG_LEVEL > 1) {
    console.log('event received: ', event);
  }
  const eventToParse = event.detail.event;
  if (DEBUG_LEVEL > 1) {
    console.log('eventToParse: ', eventToParse);
  }
  let parsingResult = 'success';
  let parsingError = null;
  if (DEBUG_LEVEL > 1) {
    console.log(`[SQS EVENT BUS] Event received: ${eventToParse.eventType}`);
  }
  try {
    const payload: { eventId: string } = JSON.parse(eventToParse.eventPayload);

    await EventSourcing.traverseTime({
      eventSourcingCollection:
        process.env.MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME,
      eventId: payload.eventId,
      collectionsToRebuild,
      dbConnection,
    });
  } catch (e: unknown) {
    console.error(`event parsing error`, e);
    parsingResult = 'error';
    parsingError = e as Error;
  } finally {
    console.log(
      `[Time travelling finally] Post message: ${eventToParse.eventType}`,
    );
    await EventManager.publishEventToEventBus({
      eventBusName: EventBus.OutputEventBus.eventBusName,
      eventObject: {
        eventType: ResultEventType.POST_TO_CLIENT,
        eventParsed: event.detail.event,
        message: parsingResult,
        error: parsingError?.message,
      },
    });
  }
}
