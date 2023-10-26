import { type SQSEvent } from 'aws-lambda'
import { type SourceEvent, TimeTravelEventType } from '../../../../../types/events'
import { connectToDatabase } from 'src/db/connectToDatabase'
import { playerEventParser } from 'src/player/modules/playerEventParser'
import { postMessage } from 'src/ws/modules/postMessage'

export async function main (event: SQSEvent): Promise<void> {
  console.log('[SQS TIME TRAVEL PARSER] Event received')
  const db = await connectToDatabase()
  if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
    throw Error('Define players collection')
  }
  if (process.env.MONGODB_EVENT_COLLECTION_NAME === undefined) {
    throw Error('Define events collection')
  }
  for (let i = 0; i < event.Records.length; i++) {
    const e = event.Records[i]
    const messageBody = JSON.parse(e.body).Message
    const eventId: SourceEvent = (JSON.parse(messageBody).eventId)
    // Aggregation pipeline to get all the events recorded before the evetID and the eventId itself
    const aggregationPipeline = [
      {
        $match: {
          eventId
        }
      },
      {
        $facet: {
          originalEvent: [
            {
              $project: {
                eventId: 1,
                eventType: 1,
                eventPayload: 1,
                eventDate: 1
              }
            }
          ],
          eventsAfterSpecificEvent: [
            {
              $lookup: {
                from: process.env.MONGODB_EVENT_COLLECTION_NAME,
                let: { specificEventDate: '$eventDate' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $lt: ['$eventDate', '$$specificEventDate'] },
                          { $ne: ['$eventId', eventId] }
                        ]
                      }
                    }
                  },
                  {
                    $sort: { eventDate: 1 }
                  },
                  {
                    $project: {
                      _id: 1,
                      eventId: 1,
                      eventType: 1,
                      eventPayload: 1,
                      eventDate: 1
                    }
                  }
                ],
                as: 'eventsAfterSpecificEvent'
              }
            },
            {
              $unwind: '$eventsAfterSpecificEvent'
            },
            {
              $replaceRoot: { newRoot: '$eventsAfterSpecificEvent' }
            },
            {
              $project: {
                eventId: 1,
                eventType: 1,
                eventPayload: 1,
                eventDate: 1
              }
            },
            {
              $sort: { eventDate: 1 }
            }
          ]
        }
      },
      {
        $project: {
          combinedResults: {
            $concatArrays: ['$originalEvent', '$eventsAfterSpecificEvent']
          }
        }
      },
      {
        $unwind: '$combinedResults'
      },
      {
        $replaceRoot: { newRoot: '$combinedResults' }
      },
      {
        $sort: { eventDate: 1 }
      }
    ]
    const cursor = db.collection(process.env.MONGODB_EVENT_COLLECTION_NAME).aggregate(aggregationPipeline)
    const rebuildingCollectionName = `${process.env.MONGODB_PLAYERS_COLLECTION_NAME}_rebuilding`
    await db.collection(rebuildingCollectionName).drop().catch((error) => {
      if (error.codeName !== 'NamespaceNotFound') {
        throw error
      }
    })
    await db.collection(rebuildingCollectionName).createIndex({ playerRole: 1 })
    await db.collection(rebuildingCollectionName).createIndex({ playerName: 1 })
    await db.collection(rebuildingCollectionName).createIndex({ playerId: 1 })
    while (await cursor.hasNext()) {
      const eventToReplay = await cursor.next() as SourceEvent
      if (eventToReplay !== null) {
        await playerEventParser(eventToReplay, db, rebuildingCollectionName)
      }
    }
    const oldCollectionName = `${process.env.MONGODB_PLAYERS_COLLECTION_NAME}_previous`
    await db.collection(oldCollectionName).drop().catch((error) => {
      if (error.codeName !== 'NamespaceNotFound') {
        throw error
      }
    })
    await db.collection(process.env.MONGODB_PLAYERS_COLLECTION_NAME).rename(oldCollectionName).catch((error) => {
      console.log(error.codeName)
      if (error.codeName !== 'NamespaceNotFound') {
        throw error
      }
    })
    await db.collection(rebuildingCollectionName).rename(process.env.MONGODB_PLAYERS_COLLECTION_NAME)
    await postMessage({ type: TimeTravelEventType.TimeTravelled, message: 'success' })
  }
}
