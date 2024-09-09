import { type Static, Type } from '@sinclair/typebox';

export enum PlayerRole {
  CARRY = 'CARRY',
  SUPPORT = 'SUPPORT',
  MID = 'MID',
  JUNGLE = 'JUNGLE',
  TOP = 'TOP',
}

export enum PlayerEventType {
  PlayerCreated = 'PlayerCreated',
  PlayerNameUpdated = 'PlayerNameUpdated',
  PlayerRoleUpdated = 'PlayerRoleUpdated',
  PlayerDeleted = 'PlayerDeleted',
}

export const PlayerResourceSchema = Type.Object({
  _id: Type.String(),
  version: Type.Number(),
  name: Type.String(),
  role: Type.Enum(PlayerRole),
  created: Type.Number(),
  updated: Type.Number(),
  deleted: Type.Optional(Type.Number()),
});

export type PlayerResource = Static<typeof PlayerResourceSchema>;

const createPlayerPayloadSchema = Type.Pick(PlayerResourceSchema, [
  'name',
  'role',
  'version',
  '_id',
]);

export type CreatePlayerPayload = Static<typeof createPlayerPayloadSchema>;

const updatePlayerBodySchema = Type.Object({
  id: Type.String(),
  name: Type.Optional(Type.String()),
  role: Type.Optional(Type.Enum(PlayerRole)),
});

export type UpdatePlayerBody = Static<typeof updatePlayerBodySchema>;

const updatePlayerNamePayloadSchema = Type.Pick(PlayerResourceSchema, [
  'name',
  '_id',
]);

export type UpdatePlayerNamePayload = Static<
  typeof updatePlayerNamePayloadSchema
>;

const updatePlayerRolePayloadSchema = Type.Pick(PlayerResourceSchema, [
  'role',
  '_id',
]);

export type UpdatePlayerRolePayloadSchema = Static<
  typeof updatePlayerRolePayloadSchema
>;

const playerDeletedPayloadSchema = Type.Pick(PlayerResourceSchema, ['_id']);

export type PlayerDeletedPayload = Static<typeof playerDeletedPayloadSchema>;

export const playerEventPayloadSchema = Type.Union([
  createPlayerPayloadSchema,
  playerDeletedPayloadSchema,
  updatePlayerRolePayloadSchema,
  updatePlayerNamePayloadSchema,
]);

export type PlayerEventPayload = Static<typeof playerEventPayloadSchema>;
