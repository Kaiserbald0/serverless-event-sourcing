import { DynamoDB } from 'aws-sdk'
import { type APIGatewayProxyHandler } from 'aws-lambda'
import { Table } from 'sst/node/table'

const dynamoDb = new DynamoDB.DocumentClient()

export const main: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('[WSAPI HANDLER] Connect')
  const params = {
    TableName: Table.WSConnections.tableName,
    Key: {
      id: event.requestContext.connectionId
    }
  }

  await dynamoDb.delete(params).promise()

  return { statusCode: 200, body: 'Disconnected' }
}
