import {
  EventBus,
  Function,
  Stack,
  type StackContext,
  Table,
  WebSocketApi,
} from 'sst/constructs';
import {
  EventTypes,
  ResultEventType,
  TimeTravelEventType,
} from '@event-sourcing-demo/core/eventSourcing/eventSourcingEventsSchema';
import { PlayerEventType } from '@event-sourcing-demo/core/players/playersSchema';
import {
  MONGODB_DB_NAME,
  MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME,
  MONGODB_PLAYERS_COLLECTION_NAME,
  PLAYERS_DOCUMENT_CURRENT_VERSION,
} from './DbConf';

const eventsToParse = [
  {
    events: [PlayerEventType.PlayerNameUpdated],
    handler: 'packages/functions/eventBus/player/nameUpdated.main',
    wsHandler: 'packages/functions/webSocket/events/player/nameUpdated.main',
    timeout: 30,
  },
  {
    events: [PlayerEventType.PlayerRoleUpdated],
    handler: 'packages/functions/eventBus/player/roleUpdated.main',
    wsHandler: 'packages/functions/webSocket/events/player/roleUpdated.main',
    timeout: 30,
  },
  {
    events: [PlayerEventType.PlayerCreated],
    handler: 'packages/functions/eventBus/player/created.main',
    wsHandler: 'packages/functions/webSocket/events/player/created.main',
    timeout: 30,
  },
  {
    events: [PlayerEventType.PlayerDeleted],
    handler: 'packages/functions/eventBus/player/deleted.main',
    wsHandler: 'packages/functions/webSocket/events/player/deleted.main',
    timeout: 30,
  },
  {
    events: [TimeTravelEventType.RestoredFromPastEvent],
    handler:
      'packages/functions/eventBus/timeTravel/restoredFromPastEvent.main',
    wsHandler: 'packages/functions/webSocket/events/restoredFromPastEvent.main',
    timeout: 120,
  },
];

const outputEvents = [ResultEventType.POST_TO_CLIENT];

function createRules(options: {
  handler: string;
  stack: Stack;
  events: EventTypes[] | TimeTravelEventType[];
  timeout?: number;
  outputEventBus: EventBus;
  environment: { [key: string]: string };
}) {
  const { stack, handler, events, timeout, outputEventBus, environment } =
    options;
  return {
    pattern: {
      detailType: events,
    },
    targets: {
      consumer: new Function(stack, `${events.join('-')}-Function`, {
        handler,
        bind: [outputEventBus],
        timeout: timeout || 30,
        environment,
      }),
    },
  };
}

export function EventBusStack({ stack }: StackContext) {
  const wsConnectionTable = new Table(stack, 'WebSocketConnections', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const environment = {
    MONGODB_URI: process.env.MONGODB_URI ?? '',
    MONGODB_DB_NAME: MONGODB_DB_NAME ?? '',
    MONGODB_PLAYERS_COLLECTION_NAME: MONGODB_PLAYERS_COLLECTION_NAME ?? '',
    PLAYERS_DOCUMENT_CURRENT_VERSION: PLAYERS_DOCUMENT_CURRENT_VERSION ?? '1',
    MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME:
      MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME ?? '',
  };

  const outputEventBus = new EventBus(stack, 'OutputEventBus', {
    defaults: {
      retries: 10,
    },
    rules: {
      [ResultEventType.POST_TO_CLIENT]: {
        pattern: {
          detailType: outputEvents,
        },
        targets: {
          consumer: new Function(stack, `${outputEvents.join('-')}-Function`, {
            handler: 'packages/functions/eventBus/postToClient.main',
            bind: [wsConnectionTable],
            timeout: 30,
            environment,
          }),
        },
      },
    },
  });

  const rules = eventsToParse.reduce(
    (acc, { events, handler, timeout }) => {
      const key = events.join('-');
      acc[key] = createRules({
        stack,
        handler,
        events,
        timeout,
        outputEventBus,
        environment,
      });
      return acc;
    },
    {} as { [key: string]: ReturnType<typeof createRules> },
  );

  const eventBus = new EventBus(stack, 'MainEventBus', {
    defaults: {
      retries: 10,
    },
    rules,
  });

  const routes = eventsToParse
    .filter(event => event.wsHandler)
    .reduce(
      (acc, { events, wsHandler }) => {
        if (wsHandler) {
          const key = events.join('-');
          acc[key] = wsHandler;
        }
        return acc;
      },
      {} as { [key: string]: string },
    );

  const wsApi = new WebSocketApi(stack, 'WebSocketApi', {
    defaults: {
      function: {
        bind: [wsConnectionTable, eventBus],
        environment,
      },
    },
    routes: {
      ...routes,
      $connect: 'packages/functions/webSocket/connect.main',
      $disconnect: 'packages/functions/webSocket/disconnect.main',
    },
  });

  outputEventBus.bind([wsApi]);

  return {
    eventBus,
    outputEventBus,
    wsApi,
  };
}
