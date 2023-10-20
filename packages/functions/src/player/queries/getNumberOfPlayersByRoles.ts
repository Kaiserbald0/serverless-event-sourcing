import AWS from 'aws-sdk';
import { Topic } from 'sst/node/topic';

const sns = new AWS.SNS();

export async function main() {
  return {
    statusCode: 200,
    body: JSON.stringify({ data: [{
      role: 'B',
      numberOfPlayers: '1',
    }, {
      id: 'uuid',
      numberOfPlayers: '3',
    }] }),
  };
}
