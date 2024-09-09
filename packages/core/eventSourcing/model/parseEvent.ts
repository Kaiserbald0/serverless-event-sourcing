import { SQSRecord } from 'aws-lambda';

const DEBUG_LEVEL = 0;

export const parseEvent = (e: SQSRecord) => {
  const parsedBody = JSON.parse(e.body);
  if (DEBUG_LEVEL > 1) {
    console.log('EVENT BUS - parsedBody', parsedBody);
  }
  return parsedBody.detail.event;
};
