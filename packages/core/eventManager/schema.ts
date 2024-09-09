export type EventBridgeEventDetail<TDetail> = {
  version: string;
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: TDetail;
};
