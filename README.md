# serverless-event-sourcing example

This is a experiment to try a simple serverless event sourcing API on AWS.

The stack is managed using [SST](https://sst.dev/guide.html)

Pre-requisite (as far I can remember :))

- Node.js 16 or later (node.org)
- AWS CLI (https://aws.amazon.com/cli/)
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
| GetNumberOfPlayerByRoles |

| APIs  |  | | |
|----------|:-------------:|------|- |
| Endpoints   | Method    | Payload | Command Triggered |
| players  |POST| {name: STRING, role: STRING }  | CreatePlayer
| players/:id |PUT| { name: STRING, role: STRING } | UpdatePlayer
| players/:id |DELETE| DeletePlayer

`npx sst dev --profile=sst_demo`
`npx sst remove`