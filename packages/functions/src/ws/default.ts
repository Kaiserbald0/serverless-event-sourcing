import { type Context, type APIGatewayProxyResult, type APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'

export async function main (event: APIGatewayProxyWebsocketEventV2, context: Context): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('[WSAPI HANDLER] default')
  return {
    statusCode: 200,
    body: JSON.stringify({ result: 'default' })
  }
}
