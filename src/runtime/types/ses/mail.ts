/**
 * The email that produced the event.
 * @see https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html#event-publishing-retrieving-sns-contents-mail-object
 */
export interface Mail {
  /**
   * The date and time, in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ), when the message was sent.
   */
  timestamp: string

  /**
   * A unique ID that Amazon SES assigned to the message. Amazon SES returned this value when the message was sent.
   *
   * This message ID was assigned by Amazon SES. You can find the message ID of the original email in the `headers` and `commonHeaders` fields of the `mail` object.
   */
  messageId: string

  /**
   * The email address from which the original message was sent (the envelope MAIL FROM address)
   */
  source: string

  /**
   * The Amazon Resource Name (ARN) of the identity used to send the email.
   * In the case of sending authorization, the `sourceArn` is the ARN of the identity that the identity owner authorized the delegate sender to use to send the email.
   * For more information about sending authorization, see [Email authentication methods](https://docs.aws.amazon.com/ses/latest/dg/sending-authorization.html).
   */
  sourceArn: string

  /**
   * The AWS account ID of the account that was used to send the email.
   * In the case of sending authorization, the `sendingAccountId` is the delegate sender's account ID.
   */
  sendingAccountId: string

  /**
   * A list of email addresses that were recipients of the original mail
   */
  destination: string[]

  /**
   * Specifies whether the headers are truncated in the notification, which occurs if the headers are larger than 10 KB.
   * //TODO: Make sure the string is coerced to a boolean.
   */
  headersTruncated: boolean

  /**
   * A list of the email's original headers. Each header has a `name` field and a `value` field.
   *
   * Any message ID within the `headers` field is from the original message that you passed to Amazon SES. The message ID that Amazon SES subsequently assigned to the message is in the `messageId` field of the `mail` object.
   */
  headers: Array<{ name: string, value: string }>

  /**
   * InclA mapping of the email's original, commonly used headers.
   *
   * Any message ID within the `commonHeaders` field is the message ID that Amazon SES subsequently assigned to the message in the `messageId` field of the `mail` object.
   */
  commonHeaders?: {
    from: string[]
    to: string[]
    date?: string
    subject?: string
    messageId?: string
  }

  /**
   * A list of tags associated with the email.
   */
  tags: Record<string, string[]>
}
