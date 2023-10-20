import AWS from 'aws-sdk';
import { Topic } from 'sst/node/topic';

const sns = new AWS.SNS();

export async function main() {
  return {
    statusCode: 200,
    body: JSON.stringify({ data: [{
      id: 'uuid',
      role: 'B',
    }, {
      id: 'uuid',
      role: 'C',
    }] }),
  };
}
