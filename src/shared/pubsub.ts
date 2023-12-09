export enum PubSubMessageType {
  NEW_NOTIFICATIONS = 'NEW_NOTIFICATIONS',
}

export interface PubSubMessage {
  type: PubSubMessageType
  data?: object
}
