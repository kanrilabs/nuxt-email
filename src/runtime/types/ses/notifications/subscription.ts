interface TopicSubscriptionStatus {
  topicName: string
  subscriptionStatus: 'OptIn' | 'OptOut'
}

interface TopicPreferences {
  /**
   * Specifies if the contact unsubscribed from all the topics in the contact list.
   */
  unsubscribeAll: boolean
  /**
   * Specifies the subscription status of the topic in the `topicName` field indicating whether it is currently subscribed to receive notifications from SES for the specified event type.
   */
  topicSubscriptionStatus: Array<TopicSubscriptionStatus>
  /**
   * Specifies the default subscription status of the topic in the `topicName` field determining whether new topics added to the event destination will be subscribed or unsubscribed by default.
   */
  topicDefaultSubscriptionStatus?: Array<TopicSubscriptionStatus>
}

export interface Subscription {
  /**
   * The name of the list the contact is on.
   */
  contactList: string
  /**
   * The date and time, in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ), when the ISP sent the subscription notification.
   */
  timestamp: string
  /**
   * The email address that the message was sent from (the envelope MAIL FROM address).
   */
  source: string
  /**
   * Specifies the subscription status of all the topics in the contact list indicating the status after a change (contact subscribed or unsubscribed).
   */
  newTopicPreferences: TopicPreferences
  /**
   * Specifies the subscription status of all the topics in the contact list indicating the status before the change (contact subscribed or unsubscribed).
   */
  oldTopicPreferences: TopicPreferences
}
