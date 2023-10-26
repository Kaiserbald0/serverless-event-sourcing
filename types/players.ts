export interface Player {
  playerId: string
  playerRole: string
  playerName: string
  created: number
  updated: number
};

export interface PlayerResource extends Player {
  _id: string
};
