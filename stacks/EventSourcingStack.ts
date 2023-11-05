import { Api, Function, Queue, type StackContext, Topic } from 'sst/constructs'

export function EventSourcingStack ({ stack }: StackContext): void {
  const eventParserFunction = new Function(stack, 'eventParserFunction', {
    handler: 'packages/functions/src/player/events/eventParser.main',
    environment: {
      MONGODB_URI: (process.env.MONGODB_URI ?? ''),
      MONGODB_DB_NAME: (process.env.MONGODB_DB_NAME ?? ''),
      MONGODB_PLAYERS_COLLECTION_NAME: (process.env.MONGODB_PLAYERS_COLLECTION_NAME ?? '')
    }
  })

  const playerEventsQueue = new Queue(stack, 'PlayerEventsQueue', {
    consumer: eventParserFunction
  })

  const playerEventsTopic = new Topic(stack, 'PlayerEventsTopic', {
    subscribers: {
      playerEventQueue: playerEventsQueue
    }
  })

  const api = new Api(stack, 'Api', {
    defaults: {
      function: {
        bind: [playerEventsTopic],
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
      'GET /players/roles': 'packages/functions/src/player/queries/getPlayerRoles.main'
    }
  })

  stack.addOutputs({
    ApiEndpoint: api.url
  })
}
