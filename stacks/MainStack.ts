import { Api, RemixSite, type StackContext, use } from 'sst/constructs';
import {
  MONGODB_DB_NAME,
  MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME,
  MONGODB_PLAYERS_COLLECTION_NAME,
  PLAYERS_DOCUMENT_CURRENT_VERSION,
} from './DbConf';
import { EventBusStack } from './EventBusStack';

export function MainStack({ stack }: StackContext): void {
  const { eventBus, wsApi } = use(EventBusStack);
  const api = new Api(stack, 'Api', {
    defaults: {
      function: {
        timeout: 30,
        bind: [eventBus],
        environment: {
          MONGODB_URI: process.env.MONGODB_URI ?? '',
          MONGODB_DB_NAME: MONGODB_DB_NAME ?? '',
          MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME:
            MONGODB_EVENT_SOURCING_EVENT_COLLECTION_NAME ?? '',
          MONGODB_PLAYERS_COLLECTION_NAME:
            MONGODB_PLAYERS_COLLECTION_NAME ?? '',
          PLAYERS_DOCUMENT_CURRENT_VERSION:
            PLAYERS_DOCUMENT_CURRENT_VERSION ?? '1',
        },
      },
    },
    routes: {
      'GET /players': 'packages/functions/rest/reads/players.main',
      'GET /eventsourcing/events':
        'packages/functions/rest/reads/eventSourcing.main',
    },
  });

  const adminSite = new RemixSite(stack, 'AdminSite', {
    path: 'admin/',
    environment: {
      API_URL: api.url,
      WEBSOCKET_URL: wsApi.url,
    },
  });

  stack.addOutputs({
    WSEndpoint: wsApi.url,
    ApiEndpoint: api.url,
    URLFrontEnd: adminSite.url ?? 'localhost',
  });
}
