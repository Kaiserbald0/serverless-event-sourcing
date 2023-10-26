import AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { type Context, type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { Topic } from 'sst/node/topic'
import { connectToDatabase } from 'src/db/connectToDatabase'
import { type SourceEvent, SourceEventType } from '../../../../../types/events'

const sns = new AWS.SNS()

export async function main (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false
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
      eventPayload = { ...JSON.parse(event.body), playerId: v4() }
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
      body: JSON.stringify({ status: 'failed', message: 'unrecognized command' })
    }
  }
  const eventObjetc: SourceEvent = {
    eventId,
    eventType,
    eventPayload: JSON.stringify(eventPayload),
    eventDate
  }
  const db = await connectToDatabase()
  try {
    if (process.env.MONGODB_EVENT_COLLECTION_NAME === undefined) {
      throw Error('Define event collection')
    }
    await db.collection(process.env.MONGODB_EVENT_COLLECTION_NAME).insertOne(eventObjetc)
    console.log('[API HANDLER] Event stored')
    await sns
      .publish({
        TopicArn: Topic.PlayerEventsTopic.topicArn,
        Message: JSON.stringify({ event: eventObjetc }),
        MessageStructure: 'string'
      })
      .promise()
    console.log('[API HANDLER] Event published')
    return {
      statusCode: 200,
      body: JSON.stringify({ result: 'success' })
    }
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify(e)
    }
  }
}
