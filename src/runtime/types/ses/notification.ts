import type { Bounce } from './notifications/bounce'
import type { Complaint } from './notifications/complaint'
import type { Delay } from './notifications/delay'
import type { Delivery } from './notifications/delivery'
import type { Mail } from './mail'
import type { Subscription } from './notifications/subscription'

export type NotificationType = 'Bounce' | 'Complaint' | 'Delivery' | 'Send' | 'Reject' | 'Open' | 'Click' | 'Rendering Failure' | 'DeliveryDelay' | 'Subscription'
interface BaseNotification {
  /**
   * Indicates the type of event.
   */
  eventType: NotificationType
  /**
   * Contains information about the email that produced the event.
   */
  mail: Mail
}

export interface BounceNotification extends BaseNotification {
  eventType: 'Bounce'
  /**
   * Contains information about the bounce.
   */
  bounce: Bounce
}

export interface ComplaintNotification extends BaseNotification {
  eventType: 'Complaint'
  /**
   * Contains information about the complaint.
   */
  complaint: Complaint
}

export interface DeliveryNotification extends BaseNotification {
  eventType: 'Delivery'
  /**
   * Contains information about the delivery.
   */
  delivery: Delivery
}

export interface SendNotification extends BaseNotification {
  eventType: 'Send'
  /**
   * Always empty.
   */
  send: Record<string, never>
}

export interface RejectNotification extends BaseNotification {
  eventType: 'Reject'
  /**
   * Contains information about the rejection.
   */
  reject: {
    /**
     * The reason the email was rejected. The only possible value is Bad content, which means that Amazon SES detected that the email contained a virus. When a message is rejected, Amazon SES stops processing it, and doesn't attempt to deliver it to the recipient's mail server.
     */
    reason: 'Bad content'
  }
}

export interface OpenNotification extends BaseNotification {
  eventType: 'Open'
  /**
   * Contains information about the open event.
   */
  open: {
    /**
     * The recipient's IP address.
     */
    ipAddress: string
    /**
     * The date and time when the open event occurred in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ).
     */
    timestamp: string
    /**
     * The user agent of the device or email client that the recipient used to open the email.
     */
    userAgent: string
  }
}

export interface ClickNotification extends BaseNotification {
  eventType: 'Click'
  /**
   * Contains information about the click event.
   */
  click: {
    /**
     * The recipient's IP address.
     */
    ipAddress: string
    /**
     * The date and time when the click event occurred in ISO8601 format (YYYY-MM-DDThh:mm:ss.sZ).
     */
    timestamp: string
    /**
     * The user agent of the device or email client that the recipient used to click the link.
     */
    userAgent: string
    /**
     * The URL of the link that the recipient clicked.
     */
    link: string
    /**
     * A list of tags that were added to the link using the `ses:tags` attribute.
     * For more information about adding tags to links in your emails, see [Q5. Can I tag links with unique identifiers?](https://docs.aws.amazon.com/ses/latest/dg/faqs-metrics.html#sending-metric-faqs-clicks-q5) in the [Amazon SES email sending metrics FAQs](https://docs.aws.amazon.com/ses/latest/dg/faqs-metrics.html).
     */
    linkTags: Record<string, string[]>
  }
}

export interface RenderingFailureNotification extends BaseNotification {
  eventType: 'Rendering Failure'
  /**
   * Contains information about the rendering failure event.
   */
  failure: {
    /**
     * The name of the template used to send the email.
     */
    templateName: string
    /**
     * A message that provides more information about the rendering failure.
     */
    errorMessage: string
  }
}

export interface DeliveryDelayNotification extends BaseNotification {
  eventType: 'DeliveryDelay'
  /**
   * Contains information about the delayed delivery of an email.
   */
  delay: Delay
}

export interface SubscriptionNotification extends BaseNotification {
  eventType: 'Subscription'
  /**
   * Contains information about the subscription preferences.
   */
  subscription: Subscription
}

export type Notification =
  | BounceNotification
  | ComplaintNotification
  | DeliveryNotification
  | SendNotification
  | RejectNotification
  | OpenNotification
  | ClickNotification
  | RenderingFailureNotification
  | DeliveryDelayNotification
  | SubscriptionNotification
