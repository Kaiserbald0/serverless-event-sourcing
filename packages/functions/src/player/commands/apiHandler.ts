import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand
} from '@aws-sdk/lib-dynamodb'
import { v4 } from 'uuid'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { Table } from 'sst/node/table'
import { type SourceEvent, SourceEventType } from '../types'

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export async function main (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const eventId = v4()
  const eventDate = new Date().getTime()
  const eventContext = event.requestContext as any
  const method = eventContext.http.method
  let eventType: SourceEventType | null = null
  let eventPayload = null
  switch (method) {
    case 'POST':
      if (event.body == null) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'body is needed' })
        }
      }
      eventType = SourceEventType.PlayerCreated
      eventPayload = JSON.parse(event.body)
      break
    case 'DELETE':
      eventType = SourceEventType.PlayerDeleted
      eventPayload = { playerId: event.pathParameters?.id }
      break
    case 'PATCH':
      eventType = SourceEventType.PlayerUpdated
      if (event.body == null) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'body is needed' })
        }
      }
      eventPayload = event.body
      eventPayload = { ...JSON.parse(event.body), playerId: event.pathParameters?.id }
      break
  }
  if (eventType === null || eventPayload === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'failed', message: 'unrecognized method' })
    }
  }
  const eventObjetc: SourceEvent = {
    eventId,
    eventType,
    eventPayload: JSON.stringify(eventPayload),
    eventDate
  }
  const command = new PutCommand({
    TableName: Table.events.tableName,
    Item: eventObjetc
  })
  const response = await docClient.send(command)
  if (response.$metadata.httpStatusCode === 200) {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'successful', data: eventObjetc })
    }
  }
  const statusCode = response.$metadata.httpStatusCode ?? 500
  return {
    statusCode,
    body: JSON.stringify({ status: 'failed' })
  }
}
