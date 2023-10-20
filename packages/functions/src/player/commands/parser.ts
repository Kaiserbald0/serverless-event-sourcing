import AWS from 'aws-sdk';
import { DynamoDBStreamEvent, SQSEvent } from "aws-lambda";
import { Topic } from 'sst/node/topic';

const sns = new AWS.SNS();

export async function main(event: DynamoDBStreamEvent) {
  console.log("[SQS PARSER] Event received");
  event.Records.forEach(event => {
    //we discard all events that are not insert.
    //record on the vevent table cannot be modified
    if (event.eventName == "INSERT") {
      console.log(event);
      console.log(event.dynamodb?.NewImage?.eventType);
      console.log(event.dynamodb?.NewImage?.eventPayload);
    }
  });
    // // Publish a message to topic
    // await sns
    // .publish({
    //   // Get the topic from the environment variable
    //   TopicArn: Topic.PlayerEventIngestedTopic.topicArn,
    //   Message: JSON.stringify({ event: records[0], status: "Success" }),
    //   MessageStructure: "string",
    // })
    // .promise();
    console.log("[SQS PARSER] event confirmed!");
  return {};
}