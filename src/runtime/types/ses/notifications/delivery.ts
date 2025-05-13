export interface Delivery {
  /**
   * The date and time when Amazon SES delivered the email to the recipient's mail server, in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ).
   */
  timestamp: string
  /**
   * The time in milliseconds between when Amazon SES accepted the request from the sender to when Amazon SES passed the message to the recipient's mail server.
   */
  processingTimeMillis: number
  /**
   * A list of the intended recipients that the delivery event applies to.
   */
  recipients: string[]
  /**
   * The SMTP response message of the remote ISP that accepted the email from Amazon SES. This message varies by email, by receiving mail server, and by receiving ISP.
   */
  smtpResponse: string
  /**
   * The hostname of the Amazon SES mail server that sent the mail.
   */
  reportingMTA: string
  /**
   * The IP address of the MTA to which Amazon SES delivered the email.
   */
  remoteMtaIp: string
}
