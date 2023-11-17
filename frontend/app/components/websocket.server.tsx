import WebSocket from 'ws';
import { WebSocketEventType } from '../../../types/events';

class WebSocketService {
  private static instance: WebSocketService;
  private wsConnection: WebSocket;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  private constructor(url: string) {
    this.wsConnection = new WebSocket(url);

    // Set up a general onmessage handler
    this.wsConnection.onmessage = (event) => {
      let messageData: {
        type: string
        result: string
      };
      if (typeof event.data === 'string') {
        messageData = JSON.parse(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        // Assuming the data is a Buffer or ArrayBuffer
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(new Uint8Array(event.data));
        messageData = JSON.parse(text);
      } else {
        throw new Error('Unsupported message data type');
      }

      const type = messageData.type as WebSocketEventType;

      // Call the specific message handler if registered
      if (this.messageHandlers.has(type)) {
        const handler = this.messageHandlers.get(type);
        handler?.(messageData);
      }
    };
  }

  public static getInstance(url: string): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(url);
    }
    return WebSocketService.instance;
  }

  public addMessageHandler(type: WebSocketEventType, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  // Add other WebSocket-related methods as needed

  public getWebSocketConnection(): WebSocket {
    return this.wsConnection;
  }
}

const setupWebSocket = (eventType: WebSocketEventType, onSuccess: Function, onError: Function) => {
  if (!process.env.WEBSOCKET_URL) {
    throw Error('WebSocket URL not set');
  }

  const wsService = WebSocketService.getInstance(process.env.WEBSOCKET_URL);
  wsService.addMessageHandler(eventType, (data) => {
    if (data.message === 'success') {
      onSuccess(data);
    } else {
      onError('Did not receive success');
    }
  });
};

const waitForWebSocketMessage = (eventType: WebSocketEventType) =>
  new Promise((resolve, reject) => {
    setupWebSocket(eventType, resolve, reject);
  });

export default waitForWebSocketMessage;