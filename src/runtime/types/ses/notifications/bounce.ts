type BounceType = {
  /**
   * The type of bounce, as determined by Amazon SES.
   */
  bounceType: 'Undetermined'
  /**
   * The subtype of the bounce, as determined by Amazon SES.
   */
  bounceSubType: 'Undetermined'
} | {
  /**
   * The type of bounce, as determined by Amazon SES.
   */
  bounceType: 'Permanent'
  /**
   * The subtype of the bounce, as determined by Amazon SES.
   */
  bounceSubType: 'General' | 'NoEmail' | 'Suppressed' | 'OnAccountSuppressionList'
} | {
  /**
   * The type of bounce, as determined by Amazon SES.
   */
  bounceType: 'Transient'
  /**
   * The subtype of the bounce, as determined by Amazon SES.
   */
  bounceSubType: 'General' | 'MailboxFull' | 'MessageTooLarge' | 'ContentRejected' | 'AttachmentRejected'
}

interface BouncedRecipient {
  /**
   * The email address of the recipient. If a DSN is available, this is the value of the `Final-Recipient` field from the DSN.
   */
  emailAddress: string
  /**
   * The value of the `Action` field from the DSN. This indicates the action performed by the reporting MTA as a result of its attempt to deliver the message to this recipient.
   */
  action?: string
  /**
   * The value of the `Status` field from the DSN. This is the per-recipient transport-independent status code that indicates the delivery status of the message.
   */
  status?: string
  /**
   * The status code issued by the reporting MTA. This is the value of the `Diagnostic-Code` field from the DSN. This field may be absent in the DSN (and therefore also absent in this object).
   */
  diagnosticCode?: string
}

interface BounceFields {
  /**
   * A list that contains information about the recipients of the original mail that bounced.
   */
  bouncedRecipients: BouncedRecipient[]
  /**
   * The date and time, in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ), when the ISP sent the bounce notification.
   */
  timestamp: string
  /**
   * A unique ID for the bounce.
   */
  feedbackId: string
  /**
   * The value of the `Reporting-MTA` field from the DSN. This is the value of the Message Transfer Authority (MTA) that attempted to perform the delivery, relay, or gateway operation described in the DSN.
   */
  reportingMTA?: string
  /**
   * The IP address of the Message Transfer Agent (MTA) that reported the bounce.
   */
  remoteMtaIp?: string
}

/**
 * @see https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html#event-publishing-retrieving-sns-contents-bounce-object
 */
export type Bounce = BounceType & BounceFields
