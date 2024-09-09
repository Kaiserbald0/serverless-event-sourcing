import {
  WebSocketEventType,
  WebsocketMessageData,
} from '../../../../packages/core/eventSourcing/eventSourcingEventsSchema';

export class WebSocketService {
  private static instance: WebSocketService;
  private wsConnection: WebSocket | null = null;
  private messageHandlers: Map<string, (data: WebsocketMessageData) => void> =
    new Map();
  private url: string;

  private constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    console.log('connecting to', this.url);
    this.wsConnection = new WebSocket(this.url);

    this.wsConnection.onmessage = message => {
      let messageData: WebsocketMessageData;
      if (typeof message.data === 'string') {
        messageData = JSON.parse(message.data);
      } else if (message.data instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(new Uint8Array(message.data));
        messageData = JSON.parse(text);
      } else {
        throw new Error('Unsupported message data type');
      }
      const type = messageData.eventType as WebSocketEventType;
      // Call the specific message handler if registered
      if (this.messageHandlers.has(type)) {
        const handler = this.messageHandlers.get(type);
        handler?.(messageData);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      setTimeout(() => {
        this.connect();
      }, 15000);
    };
  }

  public static init(url: string) {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(url);
    }
    return WebSocketService.instance;
  }

  public static getInstance() {
    if (!WebSocketService.instance) {
      throw 'WebSocketService not initiated, use WebSocketService.init(url) first';
    }
    return WebSocketService.instance;
  }

  public addMessageHandler(
    type: WebSocketEventType,
    handler: (data: WebsocketMessageData) => void,
  ): void {
    this.messageHandlers.set(type, handler);
  }

  public removeMessageHandler(type: WebSocketEventType): void {
    this.messageHandlers.delete(type);
  }

  public publishMessage(message: string) {
    return this.wsConnection?.send(message);
  }
}

export function setupListenerPromise(
  eventType: WebSocketEventType,
  wsService?: WebSocketService,
) {
  if (!wsService) return;
  return new Promise<WebsocketMessageData>((resolve, reject) => {
    const wsHandler = (eventData: WebsocketMessageData) => {
      wsService.removeMessageHandler(eventData.eventType as WebSocketEventType);
      if (eventData.message === 'success') {
        resolve(eventData);
      } else {
        reject(eventData);
      }
    };
    wsService.addMessageHandler(eventType, wsHandler);
  });
}

export const postAMessage = async (message: string) => {
  const wsInstance = WebSocketService.getInstance();
  return wsInstance.publishMessage(message);
};
