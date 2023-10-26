import { type SSTConfig } from 'sst'
import { WebSocketStack } from './stacks/WebSocketStack'
import { EventSourcingStack } from './stacks/EventSourcingStack'
import { EventSourcingPlayerStack } from './stacks/EventSourcingPlayerStack'
import { TimeTravelStack } from './stacks/TimeTravelStack'

export default {
  config (_input) {
    return {
      name: 'serverless-event-sourcing',
      region: 'eu-west-1'
    }
  },
  stacks (app) {
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy')
    }
    app.stack(WebSocketStack)
    app.stack(EventSourcingPlayerStack)
    app.stack(TimeTravelStack)
    app.stack(EventSourcingStack)
  }
} satisfies SSTConfig
