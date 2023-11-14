import { Function, Queue, type StackContext, Topic, use } from 'sst/constructs'
import { WebSocketStack } from './WebSocketStack'

export function EventSourcingPlayerStack ({ stack }: StackContext): {
  playerEventsTopic: Topic
} {
  const {
    wsConnectionTable,
    wsApi
  } = use(WebSocketStack)

  const eventParserFunction = new Function(stack, 'eventParserFunction', {
    handler: 'packages/functions/src/player/events/eventParser.main',
    bind: [wsApi, wsConnectionTable],
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

  return {
    playerEventsTopic
  }
}
