import { Api, Function, Queue, type StackContext, Table, Topic } from 'sst/constructs'

export function EventSourcingStack ({ stack }: StackContext): void {
  const playersTable = new Table(stack, 'players', {
    fields: {
      playerId: 'string',
      playerRole: 'string',
      playerName: 'string',
      created: 'number',
      updated: 'number'
    },
    primaryIndex: { partitionKey: 'playerId', sortKey: 'playerName' }
  })
  const eventParserFunction = new Function(stack, 'eventParserFunction', {
    handler: 'packages/functions/src/player/events/eventParser.main',
    bind: [playersTable]
  })
  const playerEventsQueue = new Queue(stack, 'PlayerEventsQueue', {
    consumer: eventParserFunction
  })
  const playerEventsTopic = new Topic(stack, 'PlayerEventsTopic', {
    subscribers: {
      playerEventQueue: playerEventsQueue
    }
  })
  const eventTableEventsHandler = new Function(stack, 'eventTableEventsHandlerFunction', {
    handler: 'packages/functions/src/player/commands/eventTableEventsHandler.main',
    bind: [playerEventsTopic]
  })
  const eventTable = new Table(stack, 'events', {
    fields: {
      eventId: 'string',
      eventType: 'string',
      eventPayload: 'string',
      eventDate: 'number'
    },
    primaryIndex: { partitionKey: 'eventId', sortKey: 'eventDate' },
    stream: true,
    consumers: {
      playerCommandParserFunction: eventTableEventsHandler
    }
  })
  const api = new Api(stack, 'Api', {
    defaults: {
      function: {
        bind: [eventTable]
      }
    },
    routes: {
      'POST /players': 'packages/functions/src/player/commands/apiHandler.main',
      'PATCH /players/{id}': 'packages/functions/src/player/commands/apiHandler.main',
      'DELETE /players/{id}': 'packages/functions/src/player/commands/apiHandler.main',
      'GET /players': 'packages/functions/src/player/queries/getPlayerList.main',
      'GET /players/roles': 'packages/functions/src/player/queries/getPlayerRoles.main',
      'GET /players/byrole': 'packages/functions/src/player/queries/getNumberOfPlayersByRoles.main'
    }
  })

  api.attachPermissionsToRoute('POST /players', ['dynamodb'])
  api.attachPermissionsToRoute('PATCH /players/{id}', ['dynamodb'])
  api.attachPermissionsToRoute('DELETE /players/{id}', ['dynamodb'])

  stack.addOutputs({
    ApiEndpoint: api.url
  })
}
