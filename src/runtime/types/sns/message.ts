export type MessageType = 'Notification' | 'SubscriptionConfirmation' | 'UnsubscribeConfirmation'

export interface BaseMessage {
  Type: MessageType
  MessageId: string
  TopicArn: string
  Message: string
  Timestamp: string
  Signature: string
  SignatureVersion: '1' | '2'
  SigningCertURL: string
}

export interface SubscriptionConfirmationMessage extends BaseMessage {
  Type: 'SubscriptionConfirmation'
  Token: string
  SubscribeURL: string
}

export interface NotificationMessage extends BaseMessage {
  Type: 'Notification'
  Subject: string
  UnsubscribeURL: string
}

export interface UnsubscribeConfirmationMessage extends BaseMessage {
  Type: 'UnsubscribeConfirmation'
}

export type Message =
  | SubscriptionConfirmationMessage
  | NotificationMessage
  | UnsubscribeConfirmationMessage
