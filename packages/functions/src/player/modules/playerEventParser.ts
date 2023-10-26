import { SourceEventType, type SourceEvent } from '../../../../../types/events'
import { type Player } from '../../../../../types/players'
import { type Db } from 'mongodb'

export async function playerEventParser (event: SourceEvent, db: Db, collectionName: string): Promise<boolean> {
  switch (event.eventType) {
    case SourceEventType.PlayerCreated: {
      const { name, role, playerId }: { name: string, role: string, playerId: string } = JSON.parse(event.eventPayload)
      if ((name !== '') && (role !== '')) {
        const playerToAdd: Player = {
          created: (new Date()).getTime(),
          updated: (new Date()).getTime(),
          playerId,
          playerName: name,
          playerRole: role
        }
        try {
          await db.collection(collectionName).insertOne(playerToAdd)
        } catch (e) {
          console.error(e)
          throw e
        }
      }
      break
    }
    case SourceEventType.PlayerUpdated: {
      const { name, role, playerId }: { name: string, role: string, playerId: string } = (JSON.parse(event.eventPayload))
      if (playerId !== '') {
        try {
          await db.collection(collectionName).updateOne(
            {
              playerId
            },
            {
              $set: {
                updated: (new Date()).getTime(),
                playerName: name,
                playerRole: role
              }
            }
          )
        } catch (e) {
          console.error(e)
          throw e
        }
      }
      break
    }
    case SourceEventType.PlayerDeleted: {
      const { playerId }: { playerId: string } = (JSON.parse(event.eventPayload))
      if (playerId !== '') {
        try {
          await db.collection(collectionName).deleteOne(
            {
              playerId
            }
          )
        } catch (e) {
          console.error(e)
          throw e
        }
      }
      break
    }
  }
  return true
}
