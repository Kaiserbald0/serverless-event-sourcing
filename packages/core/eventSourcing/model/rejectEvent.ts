import { type Db } from 'mongodb';
import { EventState, type SourceEvent } from '../eventSourcingEventsSchema';

export const rejectEvent = async ({
  eventObject,
  db,
  eventSourcingCollection,
  error,
}: {
  eventObject: SourceEvent;
  db: Db;
  eventSourcingCollection: string;
  error?: Error;
}): Promise<void> => {
  await db.collection(eventSourcingCollection).updateOne(
    { eventId: eventObject.eventId },
    {
      $set: {
        eventState: EventState.REJECTED,
        error: error?.message,
      },
    },
  );
};
