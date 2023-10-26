import { Api, type StackContext, RemixSite, use } from 'sst/constructs'
import { WebSocketStack } from './WebSocketStack'
import { EventSourcingPlayerStack } from './EventSourcingPlayerStack'
import { TimeTravelStack } from './TimeTravelStack'

export function EventSourcingStack ({ stack }: StackContext): void {
  const {
    wsApi
  } = use(WebSocketStack)

  const {
    playerEventsTopic
  } = use(EventSourcingPlayerStack)

  const {
    timeTravelTopic
  } = use(TimeTravelStack)

  const api = new Api(stack, 'Api', {
    defaults: {
      function: {
        bind: [playerEventsTopic, timeTravelTopic],
        environment: {
          MONGODB_URI: (process.env.MONGODB_URI ?? ''),
          MONGODB_DB_NAME: (process.env.MONGODB_DB_NAME ?? ''),
          MONGODB_EVENT_COLLECTION_NAME: (process.env.MONGODB_EVENT_COLLECTION_NAME ?? ''),
          MONGODB_PLAYERS_COLLECTION_NAME: (process.env.MONGODB_PLAYERS_COLLECTION_NAME ?? '')
        }
      }
    },
    routes: {
      'POST /players': 'packages/functions/src/player/commands/apiHandler.main',
      'PATCH /players/{id}': 'packages/functions/src/player/commands/apiHandler.main',
      'DELETE /players/{id}': 'packages/functions/src/player/commands/apiHandler.main',
      'GET /players': 'packages/functions/src/player/queries/getPlayers.main',
      'GET /players/roles': 'packages/functions/src/player/queries/getPlayerRoles.main',
      'GET /events': 'packages/functions/src/events/queries/getEvents.main',
      'POST /events/timetravel': 'packages/functions/src/events/timetravelling/apiHandler.main'
    }
  })

  const site = new RemixSite(stack, 'FrontendSite', {
    path: 'frontend/',
    environment: {
      API_URL: api.url,
      WEBSOCKET_URL: wsApi.url
    }
  })

  stack.addOutputs({
    WSEndpoint: wsApi.url,
    ApiEndpoint: api.url,
    URL: site.url ?? 'localhost'
  })
}
