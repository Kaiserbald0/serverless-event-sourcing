import { type APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { Table } from 'sst/node/table'

const dynamoDb = new DynamoDB.DocumentClient()

export const main: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('[WSAPI HANDLER] Connect')

  const params = {
    TableName: Table.WSConnections.tableName,
    Item: {
      id: event.requestContext.connectionId
    }
  }

  await dynamoDb.put(params).promise()

  return { statusCode: 200, body: 'Connected' }
}
