import { Api, Function, Queue, StackContext, Table, Topic } from "sst/constructs";

export function EventSourcingStack({ stack }: StackContext) {
  const playerEventIngestedTopic  = new Topic(stack, "PlayerEventIngestedTopic", {
    subscribers: {
      playerListIndexBuilder: "packages/functions/src/player/runners/playerListIndex.main"
    },
  });
  const playerCommandParserFunction = new Function(stack, "playerCommandParserFunction", {
    handler: "packages/functions/src/player/commands/parser.main",
    bind: [ playerEventIngestedTopic ]
  });
  const playerEventsQueue = new Queue(stack, "PlayerEventsQueue", {
    consumer: playerCommandParserFunction,
  });
  const eventTable = new Table(stack, "events", {
    fields: {
      eventId: "string",
      eventType: "string",
      eventPayload: "string",
      eventDate: "number",
    },
    primaryIndex: { partitionKey: "eventId", sortKey: "eventDate" },
    stream: true,
    consumers: {
      playerCommandParserFunction: playerCommandParserFunction,
    }
  });
  const playerEventsTopic  = new Topic(stack, "PlayerEventsTopic", {
    subscribers: {
      playerEventQueue: playerEventsQueue
    },
  });
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [playerEventsTopic, eventTable ]
      },
    },
    routes: {
      "POST /players": "packages/functions/src/player/commands/apiHandler.main",
      "PATCH /players/{id}": "packages/functions/src/player/commands/apiHandler.main",
      "DELETE /players/{id}": "packages/functions/src/player/commands/apiHandler.main",
      "GET /players": "packages/functions/src/player/queries/getPlayerList.main",
      "GET /players/roles": "packages/functions/src/player/queries/getPlayerRoles.main",
      "GET /players/byrole": "packages/functions/src/player/queries/getNumberOfPlayersByRoles.main",
    }
  });

  api.attachPermissionsToRoute('POST /players', ["dynamodb"]);
  api.attachPermissionsToRoute('PATCH /players/{id}', ["dynamodb"]);
  api.attachPermissionsToRoute('DELETE /players/{id}', ["dynamodb"]);

  stack.addOutputs({
    ApiEndpoint: api.url
  })
}
