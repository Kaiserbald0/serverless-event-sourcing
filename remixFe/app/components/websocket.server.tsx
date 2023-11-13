import WebSocket from 'ws';

if (!process.env.WEBSOCKET_URL) {
    throw Error('WebSocket URL not set')
}

const wsConnection = new WebSocket(process.env.WEBSOCKET_URL)

export default wsConnection;