import { type SQSEvent } from 'aws-lambda'
import { type SourceEvent } from '../../../../../types/events'
import { connectToDatabase } from 'src/db/connectToDatabase'
import { postMessage } from 'src/ws/modules/postMessage'
import { playerEventParser } from 'src/player/modules/playerEventParser'

export async function main (event: SQSEvent): Promise<void> {
  console.log('[SQS EVENT PARSER] Event received')
  if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
    throw Error('Define player collection')
  }
  const db = await connectToDatabase()
  for (let i = 0; i < event.Records.length; i++) {
    const e = event.Records[i]
    const messageBody = JSON.parse(e.body).Message
    const eventToParse: SourceEvent = (JSON.parse(messageBody).event)
    try {
      await playerEventParser(eventToParse, db, process.env.MONGODB_PLAYERS_COLLECTION_NAME)
      await postMessage(
        { type: eventToParse.eventType, message: 'success' }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
