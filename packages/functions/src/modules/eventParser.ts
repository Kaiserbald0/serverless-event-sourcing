import { SourceEventType, type SourceEvent } from '../../../../types/events'
import { type Player } from '../../../../types/players'
import { postMessage } from 'src/ws/modules/postMessage'
import { type Db } from 'mongodb'

export async function eventParser (event: SourceEvent, db: Db): Promise<boolean> {
  if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
    throw Error('Define player collection')
  }
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
          await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).insertOne(playerToAdd)
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
          await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).updateOne(
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
          await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).deleteOne(
            {
              playerId
            }
          )
          console.log('[SQS EVENT PARSER] Event PlayerDeleted parsed')
          await postMessage({
            message: JSON.stringify({ type: SourceEventType.PlayerDeleted, message: 'success' })
          })
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
