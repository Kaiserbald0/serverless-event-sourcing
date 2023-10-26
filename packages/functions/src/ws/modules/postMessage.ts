import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk'
import { Table } from 'sst/node/table'
import { WebSocketApi } from 'sst/node/websocket-api'
import { type WebSocketMessage } from '../../../../../types/events'

export const postMessage = async ({ type, message }: WebSocketMessage): Promise<boolean> => {
  const messageToSend = JSON.stringify({ type, message })
  const tableName = Table.WSConnections.tableName
  const wsEndpoint = WebSocketApi.WSApi.httpsUrl
  const dynamoDb = new DynamoDB.DocumentClient()
  const apiG = new ApiGatewayManagementApi({
    endpoint: wsEndpoint
  })
  // Get all the connections
  const connections = await dynamoDb
    .scan({ TableName: tableName, ProjectionExpression: 'id' })
    .promise()
  const postToConnection = async ({ id }: { id: any }): Promise<boolean> => {
    try {
      await apiG
        .postToConnection({ ConnectionId: id, Data: messageToSend })
        .promise()
      return true
    } catch (e: any) {
      if (e.statusCode === 410) {
        // Remove stale connections
        await dynamoDb.delete({ TableName: tableName, Key: { id } }).promise()
      }
      return false
    }
  }
  // Iterate through all the connections
  if (connections.Items != null) {
    // @ts-expect-error will change
    await Promise.all(connections.Items.map(postToConnection))
  }
  return true
}
