import { type SSTConfig } from 'sst';
import { EventBusStack } from './stacks/EventBusStack';
import { MainStack } from './stacks/MainStack';

export default {
  config() {
    return {
      name: 'event-sourcing-demo',
      region: 'eu-west-1',
    };
  },
  stacks(app) {
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy');
    }
    app.stack(EventBusStack);
    app.stack(MainStack);
  },
} satisfies SSTConfig;
