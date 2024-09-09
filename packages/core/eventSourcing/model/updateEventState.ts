import { type Db } from 'mongodb';
import { EventState, type SourceEvent } from '../eventSourcingEventsSchema';

export const updateEventState = async ({
  eventObject,
  eventState,
  db,
  eventSourcingCollection,
  error,
}: {
  eventObject: SourceEvent;
  eventState: EventState;
  db: Db;
  eventSourcingCollection: string;
  error?: Error;
}): Promise<void> => {
  await db.collection(eventSourcingCollection).updateOne(
    { eventId: eventObject.eventId },
    {
      $set: {
        eventState,
        error: error?.message,
      },
    },
  );
};
