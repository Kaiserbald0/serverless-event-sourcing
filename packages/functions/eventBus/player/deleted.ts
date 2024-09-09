import { EventManager } from '@event-sourcing-demo/core/eventManager/eventManager';
import { EventBridgeEventDetail } from '@event-sourcing-demo/core/eventManager/schema';
import { SourceEventResource } from '@event-sourcing-demo/core/eventSourcing/eventSourcingEventsSchema';
import { Player } from '@event-sourcing-demo/core/players/player';
import { PlayerDeletedPayload } from '@event-sourcing-demo/core/players/playersSchema';

const DEBUG_LEVEL = 0;

export async function main(
  event: EventBridgeEventDetail<{ event: SourceEventResource }>,
): Promise<void> {
  if (DEBUG_LEVEL > 0) {
    console.log('EVENT BUS - event received');
  }
  await EventManager.processEventBridgeEvent<PlayerDeletedPayload>({
    eventObject: event.detail.event,
    parsingFuncion: Player.remove,
  });
}
