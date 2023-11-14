import { type StackContext, WebSocketApi, Table } from 'sst/constructs'

export function WebSocketStack ({ stack }: StackContext): {
  wsConnectionTable: Table
  wsApi: WebSocketApi
} {
  const wsConnectionTable = new Table(stack, 'WSConnections', {
    fields: {
      id: 'string'
    },
    primaryIndex: { partitionKey: 'id' }
  })
  const wsApi = new WebSocketApi(stack, 'WSApi', {
    defaults: {
      function: {
        bind: [wsConnectionTable]
      }
    },
    routes: {
      $connect: 'packages/functions/src/ws/connect.main',
      $disconnect: 'packages/functions/src/ws/disconnect.main'
    }
  })

  return {
    wsConnectionTable,
    wsApi
  }
}
