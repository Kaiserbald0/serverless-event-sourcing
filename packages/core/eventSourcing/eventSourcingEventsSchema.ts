import { type Static, Type } from '@sinclair/typebox';
import { type Db, type MongoClient } from 'mongodb';
import {
  PlayerEventType,
  playerEventPayloadSchema,
} from '../players/playersSchema';

export interface DatabaseConnection {
  client: MongoClient;
  db: Db;
}
export enum EventState {
  PENDING = 'PENDING',
  PARSING = 'PARSING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum TimeTravelEventType {
  RestoredFromPastEvent = 'RestoredFromPastEvent',
}

const eventTypesSchema = Type.Union([
  Type.Enum(PlayerEventType),
  Type.Enum(TimeTravelEventType),
]);

export type EventTypes = Static<typeof eventTypesSchema>;

const eventTypesArray: EventTypes[] = [...Object.values(PlayerEventType)];

export { eventTypesArray };

const sourceEventResourceSchema = Type.Object({
  _id: Type.String(),
  version: Type.Number(),
  eventId: Type.String(),
  eventPayload: Type.String(),
  eventType: eventTypesSchema,
  eventState: Type.Enum(EventState),
  eventDate: Type.Number(),
});

export type SourceEventResource = Static<typeof sourceEventResourceSchema>;

const sourceEventSchema = Type.Omit(sourceEventResourceSchema, [
  '_id',
  'version',
]);

export type SourceEvent = Static<typeof sourceEventSchema>;

export enum ResultEventType {
  POST_TO_CLIENT = 'POST_TO_CLIENT',
}

const resultEventSchema = Type.Object({
  eventType: Type.Enum(ResultEventType),
  eventParsed: sourceEventSchema,
  message: Type.String(),
  error: Type.Optional(Type.String()),
});

export type ResultEvent = Static<typeof resultEventSchema>;

const webSocketEventTypeSchema = Type.Union([
  Type.Enum(PlayerEventType),
  Type.Enum(TimeTravelEventType),
]);

export type WebSocketEventType = Static<typeof webSocketEventTypeSchema>;

const webSocketMessageSchema = Type.Object({
  eventType: webSocketEventTypeSchema,
  message: Type.String(),
  error: Type.Optional(Type.String()),
});

export type WebSocketMessage = Static<typeof webSocketMessageSchema>;

interface IndexOption {
  name: 'unique' | 'sparse' | 'background' | 'expireAfterSeconds' | 'collation';
  value: boolean | number | object;
}

export interface CollectionToRebuild {
  collectionName: string;
  originalCollection: string;
  rebuildingCollection: string;
  oldCollection: string;
  collectionIndexes: {
    name: string;
    options?: IndexOption[];
  }[];
}

const collectionsSchema = Type.Object({
  playersCollection: Type.String(),
});

export type Collections = Static<typeof collectionsSchema>;

const documentVersionsSchema = Type.Object({
  players: Type.Integer(),
});

export type DocumentVersions = Static<typeof documentVersionsSchema>;

const eventArrayElementSchema = Type.Object({
  eventPayload: Type.Union([playerEventPayloadSchema]),
  eventType: eventTypesSchema,
  eventDate: Type.Number(),
});

export type EventArrayElement = Static<typeof eventArrayElementSchema>;

export type WebsocketMessageData = {
  eventType: string;
  message: string;
  error?: string;
};
