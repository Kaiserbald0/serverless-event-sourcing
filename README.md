# eventsourcing-event-app

This is a experiment to try a simple serverless event sourcing API on AWS using
Mongo as DB with a RemixJs frontend.

The stack is managed using [SST](https://sst.dev/guide.html)

Pre-requisite (as far I can remember :))

- Mongo Atlas account (<https://www.mongodb.com/>)
- Node.js 16 or later (<https://nodejs.org/>)
- AWS CLI (<https://aws.amazon.com/cli/>)
  - `brew install awscli`
  - `aws configure`
- AWS user (or profile) (https://aws.amazon.com/iam/)

Stack

- SST (https://sst.dev)
- Frontend: RemixJs
  - [Remix Home](https://remix.run/)
  - [SST Stack for Remix](https://docs.sst.dev/constructs/RemixSite)
- Database: Mongo on Atlas
  - [SST Connection Guide](https://sst.dev/examples/how-to-use-mongodb-atlas-in-your-serverless-app.html)

Env vars to set: (see .env.local.example) MONGODB_URI
