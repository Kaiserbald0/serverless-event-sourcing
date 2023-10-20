import AWS from 'aws-sdk';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 } from 'uuid';
import { Topic } from 'sst/node/topic';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Table } from 'sst/node/table';

type Event = {
  eventId: string;
  eventType: string;
  eventPayload: string;
  eventDate: number;
}

const sns = new AWS.SNS();
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function main(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const eventId = v4();
  const eventDate = new Date().getTime();
  const eventContext = event.requestContext as any;
  const method = eventContext.http.method;
  let eventType = null;
  let eventPayload = null;
  switch (method) {
    case 'POST':
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "body is needed" }),
          };
        }
      eventType = 'CreatePlayer';
      eventPayload = JSON.parse(event.body);
    break;
    case 'DELETE':
      eventType = 'DeletePlayer';
      eventPayload = {playerId: event.pathParameters?.id };
    break;
    case 'PATCH':
      eventType = 'UpdatePlayer';
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "body is needed" }),
        };
      }
      eventPayload = event.body;
      eventPayload = {...JSON.parse(event.body), playerId:event.pathParameters?.id };
    break;
  }
  if (!eventType || !eventPayload) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: "failed", message: 'unrecognnize method' }),
    };
  }  
  const eventObjetc: Event = {
    eventId,
    eventType,
    eventPayload: JSON.stringify(eventPayload),
    eventDate,
  }
  const command = new PutCommand({
    TableName: Table.events.tableName,
    Item: eventObjetc,
  });
  const response = await docClient.send(command);
  if (response.$metadata.httpStatusCode==200) {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "successful", data: eventObjetc }),
    };    
  }
  return {
    statusCode: response.$metadata.httpStatusCode || 500,
    body: JSON.stringify({ status: "failed" }),
  };
}
