import { Function, Queue, type StackContext, Topic, use } from 'sst/constructs'
import { WebSocketStack } from './WebSocketStack'

export function TimeTravelStack ({ stack }: StackContext): {
  timeTravelTopic: Topic
} {
  const {
    wsConnectionTable,
    wsApi
  } = use(WebSocketStack)

  const timeTravelFunction = new Function(stack, 'TimeTravelFunction', {
    handler: 'packages/functions/src/events/timetravelling/parser.main',
    bind: [wsApi, wsConnectionTable],
    environment: {
      MONGODB_URI: (process.env.MONGODB_URI ?? ''),
      MONGODB_DB_NAME: (process.env.MONGODB_DB_NAME ?? ''),
      MONGODB_PLAYERS_COLLECTION_NAME: (process.env.MONGODB_PLAYERS_COLLECTION_NAME ?? ''),
      MONGODB_EVENT_COLLECTION_NAME: (process.env.MONGODB_EVENT_COLLECTION_NAME ?? '')
    }
  })
  const timeTravelQueue = new Queue(stack, 'TimeTravelQueue', {
    consumer: timeTravelFunction,
    cdk: {
      queue: {
        fifo: true,
        contentBasedDeduplication: true
      }
    }
  })

  const timeTravelTopic = new Topic(stack, 'TimeTravelTopic', {
    subscribers: {
      playerEventQueue: timeTravelQueue
    },
    cdk: {
      topic: {
        fifo: true,
        contentBasedDeduplication: true
      }
    }
  })

  return {
    timeTravelTopic
  }
}
