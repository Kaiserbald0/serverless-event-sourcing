import { type SQSEvent } from 'aws-lambda'
import { type SourceEvent } from '../../../../../types/events'
import { connectToDatabase } from 'src/modules/db/connectToDatabase'
import { postMessage } from 'src/ws/modules/postMessage'
import { eventParser } from 'src/modules/eventParser'

export async function main (event: SQSEvent): Promise<void> {
  console.log('[SQS EVENT PARSER] Event received')
  const db = await connectToDatabase()
  for (let i = 0; i < event.Records.length; i++) {
    const e = event.Records[i]
    const messageBody = JSON.parse(e.body).Message
    const eventToParse: SourceEvent = (JSON.parse(messageBody).event)
    try {
      await eventParser(eventToParse, db)
      await postMessage({
        message: JSON.stringify({ type: eventToParse.eventType, message: 'success' })
      })
    } catch (e) {
      console.error(e)
      return
    }
  }
}
