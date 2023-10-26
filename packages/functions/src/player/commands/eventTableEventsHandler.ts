import AWS from 'aws-sdk';
import { DynamoDBStreamEvent, SQSEvent } from "aws-lambda";
import { Topic } from 'sst/node/topic';

const sns = new AWS.SNS();

export async function main(event: DynamoDBStreamEvent) {
  console.log("[DYNAMODB EVENT TABLE] Event received");
  event.Records.forEach(async event => {
    //we discard all events that are not insert.
    //record on the vevent table cannot be modified
    if (event.eventName == "INSERT") {
      // // Publish a message to topic
      await sns
      .publish({
        // Get the topic from the environment variable
        TopicArn: Topic.PlayerEventsTopic.topicArn,
        Message: JSON.stringify({ event: event.dynamodb?.NewImage}),
        MessageStructure: "string",
      })
      .promise();
      console.log("[DYNAMODB EVENT TABLE] event confirmed!");
    }
  });
  return {};
}