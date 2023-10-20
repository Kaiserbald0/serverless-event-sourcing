import { SSTConfig } from "sst";
import { EventSourcingStack } from "./stacks/eventSourcingStack";

export default {
  config(_input) {
    return {
      name: "serverless-event-sourcing",
      region: "eu-west-1",
    };
  },
  stacks(app) {
    app.stack(EventSourcingStack);
  }
} satisfies SSTConfig;
