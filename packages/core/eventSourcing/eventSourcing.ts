import { acceptEvent } from './model/acceptEvent';
import { parseEvent } from './model/parseEvent';
import { parsingEvent } from './model/parsingEvent';
import { rejectEvent } from './model/rejectEvent';
import { storeCommand } from './model/storeCommand';
import { traverseTime } from './model/traverseTime';
import { updateEventState } from './model/updateEventState';

export const EventSourcing = {
  storeCommand,
  updateEventState,
  traverseTime,
  rejectEvent,
  acceptEvent,
  parsingEvent,
  parseEvent,
};
