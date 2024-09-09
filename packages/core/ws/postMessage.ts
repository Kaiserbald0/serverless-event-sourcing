import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';
import { type WebSocketMessage } from '../eventSourcing/eventSourcingEventsSchema';

const DEBUG_LEVEL = 0;

export const postMessage = async ({
  eventType,
  message,
  error,
}: WebSocketMessage): Promise<boolean> => {
  const messageToSend = JSON.stringify({ eventType, message, error });
  const tableName = Table.WebSocketConnections.tableName;
  const wsEndpoint = WebSocketApi.WebSocketApi.httpsUrl;
  const dynamoDb = new DynamoDB.DocumentClient();
  if (DEBUG_LEVEL > 0) {
    console.log('[Post message] message to connections');
  }
  const apiG = new ApiGatewayManagementApi({
    endpoint: wsEndpoint,
  });
  const connections = await dynamoDb
    .scan({ TableName: tableName, ProjectionExpression: 'id' })
    .promise();
  if (DEBUG_LEVEL > 1) {
    console.log('[Post message] Connections', connections);
  }
  const postToConnection = async ({ id }: { id: string }): Promise<boolean> => {
    try {
      await apiG
        .postToConnection({ ConnectionId: id, Data: messageToSend })
        .promise();
      return true;
    } catch (e: any) {
      console.error(
        new Error('[Post message] Error message to connections', e),
      );
      if (e.statusCode === 410) {
        // Remove stale connections
        await dynamoDb.delete({ TableName: tableName, Key: { id } }).promise();
      }
      return false;
    }
  };
  if (connections.Items != null) {
    // @ts-expect-error will change
    await Promise.all(connections.Items.map(postToConnection));
  }
  return true;
};
