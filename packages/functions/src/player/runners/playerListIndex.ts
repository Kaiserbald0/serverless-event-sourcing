import { SNSEvent, SQSEvent } from "aws-lambda";

export async function main(event: SNSEvent) {
  const records: any[] = event.Records;
  console.log("[PLAYER LIST BUILDER] - Event received",  records[0]);
  return {};
}