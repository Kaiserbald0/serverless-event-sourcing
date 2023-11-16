import AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { type Context, type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { connectToDatabase } from 'src/modules/db/connectToDatabase'
import { Topic } from 'sst/node/topic'

const sns = new AWS.SNS()

export async function main (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false
  const db = await connectToDatabase()
  const eventContext = event.requestContext as any
  const method = eventContext.http.method
  console.log('method:', method)
  switch (method) {
    case 'POST': {
      if (process.env.MONGODB_EVENT_COLLECTION_NAME === undefined) {
        throw Error('Define events collection')
      }
      if (event.body == null) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'body is needed' })
        }
      }
      const { eventId } = JSON.parse(event.body)
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
      const messageGroupId = `Replay-${v4()}`
      while (await cursor.hasNext()) {
        const eventToReplay = await cursor.next()
        await sns
          .publish({
            TopicArn: Topic.TimeTravelTopic.topicArn,
            Message: JSON.stringify({ event: eventToReplay }),
            MessageStructure: 'string',
            MessageGroupId: messageGroupId
          })
          .promise()
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ result: 'success' })
      }
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ status: 'failed', message: 'unsupported method' })
  }
}
