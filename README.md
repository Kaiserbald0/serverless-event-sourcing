# serverless-event-sourcing

This is a experiment to try a simple serverless event sourcing API on AWS using Mongo as DB with a RemixJs frontend.
Agrregate is updated after  each event

The stack is managed using [SST](https://sst.dev/guide.html)

Pre-requisite (as far I can remember :))

- Mongo Atlas account (<https://www.mongodb.com/>)
- Node.js 16 or later (<https://nodejs.org/>)
- AWS CLI (<https://aws.amazon.com/cli/>)
  - `brew install awscli`
  - `aws configure`

Stack

- APIs: API Gateway
- Frontend: RemixJs
  - [Remix Home](https://remix.run/)
  - [SST Stack for Remix](https://docs.sst.dev/constructs/RemixSite)
- Database: Mongo on Atlas
  - [SST Connection Guide](https://sst.dev/examples/how-to-use-mongodb-atlas-in-your-serverless-app.html)

Env vars to set: (see `.env.local.example`)
MONGODB_URI
MONGODB_DB_NAME
MONGODB_EVENT_COLLECTION_NAME
MONGODB_PLAYERS_COLLECTION_NAME

Events

```JSON
fields: {
  eventId: string
  eventType: string
  eventPayload: string
  eventDate: number
}
```

| Commands  |  | | |
|----------|:-------------:|------|- |
| Domain   | Command    | Payload | Events |
| Player |  |  |
| | CreatePlayer  | {name: STRING, role: STRING }  | PlayerCreated
| | UpdatePlayer | {id: STRING, name: STRING, role: STRING }  | PlayerUpdated
| | DeletePlayer | {id: STRING }  | PlayerDeleted

| Queries   |  
|----------|
| GetPlayerList |
| GetPlayerRoles  |
| GetEvents  |

| APIs  |  | | |
|----------|:-------------:|------|- |
| Endpoints   | Method    | Payload | Command Triggered |
| players  |POST| {name: STRING, role: STRING }  | CreatePlayer
| players/:id |PUT| { name: STRING, role: STRING } | UpdatePlayer
| players/:id |DELETE| DeletePlayer
| players/ |GET|
| players/roles |GET|
| events/ |GET|

TODOs

- Event state (?)
- Implement runner(s)
- Time travelling

`npx sst dev --profile=sst_demo`
`npx sst remove  --profile=sst_demo`

Start remix fe
`npm run dev`
