import { injestEvent } from './model/injestEvent';
import { processEventBridgeEvent } from './model/processEventBridgeEvent';
import { publishEventToEventBus } from './model/publishEventToEventBus';

export const EventManager = {
  publishEventToEventBus,
  processEventBridgeEvent,
  injestEvent,
};
