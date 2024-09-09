import { type Db } from 'mongodb';
import { type SourceEvent } from '../eventSourcingEventsSchema';

export const storeCommand = async ({
  eventObject,
  db,
  eventSourcingCollection,
}: {
  eventObject: SourceEvent;
  db: Db;
  eventSourcingCollection: string;
}): Promise<void> => {
  await db.collection(eventSourcingCollection).insertOne(eventObject);
  console.log('[API HANDLER] Event stored', eventObject.eventType);
};
