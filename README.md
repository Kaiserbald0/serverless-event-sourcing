# serverless-event-sourcing

This is a experiment to try a simple serverless event sourcing API on AWS using Mongo as DB.

The stack is managed using [SST](https://sst.dev/guide.html)

Pre-requisite (as far I can remember :))

- Mongo Atlas account (<https://www.mongodb.com/>)
- Node.js 16 or later (<https://nodejs.org/>)
- AWS CLI (<https://aws.amazon.com/cli/>)
  - `brew install awscli`
  - `aws configure`

Events

Table for event

```
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

| APIs  |  | | |
|----------|:-------------:|------|- |
| Endpoints   | Method    | Payload | Command Triggered |
| players  |POST| {name: STRING, role: STRING }  | CreatePlayer
| players/:id |PUT| { name: STRING, role: STRING } | UpdatePlayer
| players/:id |DELETE| DeletePlayer
| players/ |GET| GetPlayers
| players/roles |GET| GetRoles

TODOs

- Publish event player created / added / deleted
- Event state (?)
- Validation
- Implement runner(s)

`npx sst dev --profile=sst_demo`
`npx sst remove`
