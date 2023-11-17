export enum SourceEventType {
  PlayerCreated = 'PlayerCreated',
  PlayerUpdated = 'PlayerUpdated',
  PlayerDeleted = 'PlayerDeleted'
}
export interface SourceEvent {
  eventId: string
  eventType: SourceEventType
  eventPayload: string
  eventDate: number
}
export interface SourceEventResource extends SourceEvent {
  _id: string
}

export enum TimeTravelEventType {
  TimeTravelled = 'TimeTravelled',
}

export type WebSocketEventType = SourceEventType | TimeTravelEventType
export interface WebSocketMessage {
  type: WebSocketEventType
  message: string
}
