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
