import AWS from 'aws-sdk'
import { type DynamoDBStreamEvent } from 'aws-lambda'
import { Topic } from 'sst/node/topic'

const sns = new AWS.SNS()

export async function main (event: DynamoDBStreamEvent): Promise<void> {
  console.log('[DYNAMODB EVENT TABLE] Event received')
  for (let i = 0; i < event.Records.length; i++) {
    const e = event.Records[i]
    if (e.eventName === 'INSERT') {
      // // Publish a message to topic
      await sns
        .publish({
        // Get the topic from the environment variable
          TopicArn: Topic.PlayerEventsTopic.topicArn,
          Message: JSON.stringify({ event: e.dynamodb?.NewImage }),
          MessageStructure: 'string'
        })
        .promise()
      console.log('[DYNAMODB EVENT TABLE] Event published')
    }
  }
}
