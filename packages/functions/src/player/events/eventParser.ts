import AWS from 'aws-sdk';
import { DynamoDBStreamEvent, SQSEvent } from "aws-lambda";
import { Topic } from 'sst/node/topic';
import { json } from 'stream/consumers';

const sns = new AWS.SNS();

export async function main(event: SQSEvent) {
  console.log("[SQS EVENT PARSER] Event received");
  event.Records.forEach(event => {
    const messageBody = JSON.parse(event.body).Message;
    const eventToParse = JSON.parse(messageBody)
    console.log(eventToParse);    
  });
  return {};
}