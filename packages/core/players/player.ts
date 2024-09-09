import { createPlayer } from './model/createPlayer';
import { listPlayers } from './model/listPlayers';
import { removePlayer } from './model/removePlayer';
import { updatePlayerName } from './model/updatePlayerName';
import { updatePlayerRole } from './model/updatePlayerRole';

export const Player = {
  create: createPlayer,
  list: listPlayers,
  remove: removePlayer,
  updateRole: updatePlayerRole,
  updateName: updatePlayerName,
};
