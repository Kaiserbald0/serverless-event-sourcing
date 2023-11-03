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

export interface Player {
  playerId: string
  playerRole: string
  playerName: string
  created: number
  updated: number
};
