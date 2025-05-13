type DelayType = 'InternalFailure' | 'General' | 'MailboxFull' | 'SpamDetected' | 'RecipientServerError' | 'IPFailure' | 'TransientCommunicationFailure' | 'BYOIPHostNameLookupUnavailable' | 'Undetermined' | 'SendingDeferral'

interface DelayedRecipient {
  /**
   * The email address that resulted in the delivery of the message being delayed.
   */
  emailAddress: string
  /**
   * The SMTP status code associated with the delivery delay.
   */
  status: string
  /**
   * The diagnostic code provided by the receiving Message Transfer Agent (MTA).
   */
  diagnosticsCode: string
}

export interface Delay {
  /**
   * The type of delay. For possible values, see [DeliveryDelay object](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html#event-publishing-retrieving-sns-contents-delivery-delay-object).
   */
  delayType: DelayType
  /**
   * An object that contains information about the recipient of the email.
   */
  delayedRecipients: DelayedRecipient[]
  /**
   * The date and time when Amazon SES will stop trying to deliver the message. This value is shown in ISO 8601 format.
   */
  expirationTime: string
  /**
   * The IP address of the Message Transfer Agent (MTA) that reported the delay.
   */
  reportingMTA?: string
  /**
   * The date and time when the delay occurred, shown in ISO 8601 format.
   */
  timestamp: string
}
