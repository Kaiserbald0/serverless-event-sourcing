import { type SQSEvent } from 'aws-lambda'
import { SourceEventType, type SourceEvent, type Player } from '../types'
import { v4 } from 'uuid'
import { connectToDatabase } from 'src/modules/db/connectToDatabase'
import { postMessage } from 'src/ws/modules/postMessage'

export async function main (event: SQSEvent): Promise<void> {
  console.log('[SQS EVENT PARSER] Event received')
  const db = await connectToDatabase()
  for (let i = 0; i < event.Records.length; i++) {
    const e = event.Records[i]
    const messageBody = JSON.parse(e.body).Message
    const eventToParse: SourceEvent = (JSON.parse(messageBody).event)
    if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
      throw Error('Define player collection')
    }
    switch (eventToParse.eventType) {
      case SourceEventType.PlayerCreated: {
        const { name, role }: { name: string, role: string } = JSON.parse(eventToParse.eventPayload)
        if ((name !== '') && (role !== '')) {
          const playerToAdd: Player = {
            created: (new Date()).getTime(),
            updated: (new Date()).getTime(),
            playerId: v4(),
            playerName: name,
            playerRole: role
          }
          try {
            await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).insertOne(playerToAdd)
            console.log('[SQS EVENT PARSER] Event PlayerCreated parsed')
            await postMessage({
              message: 'Player Created'
            })
            return
          } catch (e) {
            console.error(e)
            return
          }
        }
        break
      }
      case SourceEventType.PlayerUpdated: {
        const { name, role, playerId }: { name: string, role: string, playerId: string } = (JSON.parse(eventToParse.eventPayload))
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
            console.log('[SQS EVENT PARSER] Event PlayerUpdated parsed')
            await postMessage({
              message: 'Player Updated'
            })
            return
          } catch (e) {
            console.error(e)
            return
          }
        }
        break
      }
      case SourceEventType.PlayerDeleted: {
        console.log(JSON.parse(eventToParse.eventPayload))
        const { playerId }: { name: string, role: string, playerId: string } = (JSON.parse(eventToParse.eventPayload))
        if (playerId !== '') {
          try {
            await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).deleteOne(
              {
                playerId
              }
            )
            console.log('[SQS EVENT PARSER] Event PlayerDeleted parsed')
            await postMessage({
              message: 'Player Deleted'
            })
            return
          } catch (e) {
            console.error(e)
            return
          }
        }
        break
      }
    }
  }
}
