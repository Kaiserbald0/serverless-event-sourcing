import {
  WebSocketEventType,
  WebsocketMessageData,
} from '../../../../packages/core/eventSourcing/eventSourcingEventsSchema';
import {
  WebSocketService,
  postAMessage,
  setupListenerPromise,
} from './websocket.client';

export const awaitWebsocketAPI = async (
  eventsToAwait: WebSocketEventType[],
  messagesToPost: {
    payload: object;
    action: WebSocketEventType;
  }[],
) => {
  const wsInstance = WebSocketService.getInstance();
  const promises = eventsToAwait.map(event =>
    setupListenerPromise(event, wsInstance),
  );

  const postMessagePromises = messagesToPost.map(messageToPost => {
    return postAMessage(JSON.stringify(messageToPost));
  });

  try {
    await Promise.all(postMessagePromises);
    await Promise.all(promises);
    return { result: 'success', errors: [] };
  } catch (e) {
    if (e instanceof Error) {
      return { errors: [e.message] };
    }
    return { errors: [(e as WebsocketMessageData).error || 'Unknown error'] };
  }
};
