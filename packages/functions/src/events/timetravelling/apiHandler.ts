import AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { type Context, type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { Topic } from 'sst/node/topic'

const sns = new AWS.SNS()

export async function main (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const eventContext = event.requestContext as any
  const method = eventContext.http.method
  switch (method) {
    case 'POST': {
      if (process.env.MONGODB_EVENT_COLLECTION_NAME === undefined) {
        throw Error('Define events collection')
      }
      if (event.body == null) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'body is needed' })
        }
      }
      const { eventId } = JSON.parse(event.body)
      const messageGroupId = `Replay-${v4()}`
      try {
        await sns
          .publish({
            TopicArn: Topic.TimeTravelTopic.topicArn,
            Message: JSON.stringify({ eventId }),
            MessageStructure: 'string',
            MessageGroupId: messageGroupId
          })
          .promise()
        return {
          statusCode: 200,
          body: JSON.stringify({ result: 'success' })
        }
      } catch (e) {
        console.error(e)
        return {
          statusCode: 500,
          body: JSON.stringify({ result: 'cannot publish' })
        }
      }
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ status: 'failed', message: 'unsupported method' })
  }
}
