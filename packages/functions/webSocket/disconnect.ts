import { type APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('[WSAPI HANDLER] Disconnect');
  const params = {
    TableName: Table.WebSocketConnections.tableName,
    Key: {
      id: event.requestContext.connectionId,
    },
  };

  await dynamoDb.delete(params).promise();

  return { statusCode: 200, body: 'Disconnected' };
};
