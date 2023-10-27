import { type SQSEvent } from 'aws-lambda'

export async function main (event: SQSEvent): Promise<void> {
  console.log('[SQS EVENT PARSER] Event received')
  event.Records.forEach(event => {
    const messageBody = JSON.parse(event.body).Message
    const eventToParse = JSON.parse(messageBody)
    console.log(eventToParse)
  })
}
