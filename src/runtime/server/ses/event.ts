import type { H3Event } from 'h3'
import { getHeader, defineEventHandler, readBody, createError } from 'h3'
import { destr } from 'destr'
import type {
  Notification,
  BounceNotification,
  ClickNotification,
  ComplaintNotification,
  DeliveryDelayNotification,
  DeliveryNotification,
  OpenNotification,
  RejectNotification,
  RenderingFailureNotification,
  SendNotification,
  SubscriptionNotification,
} from '../../types/ses/notification'
import type {
  NotificationMessage,
  SubscriptionConfirmationMessage,
  UnsubscribeConfirmationMessage,
} from '../../types/sns/message'

interface SESNotificationOptions {
  onBounce?: (event: H3Event, bounce: BounceNotification) => void | Promise<void>
  onClick?: (event: H3Event, click: ClickNotification) => void | Promise<void>
  onComplaint?: (event: H3Event, complaint: ComplaintNotification) => void | Promise<void>
  onDelivery?: (event: H3Event, delivery: DeliveryNotification) => void | Promise<void>
  onDeliveryDelay?: (event: H3Event, delay: DeliveryDelayNotification) => void | Promise<void>
  onOpen?: (event: H3Event, open: OpenNotification) => void | Promise<void>
  onReject?: (event: H3Event, reject: RejectNotification) => void | Promise<void>
  onRenderingFailure?: (event: H3Event, failure: RenderingFailureNotification) => void | Promise<void>
  onSend?: (event: H3Event, send: SendNotification) => void | Promise<void>
  onSubscription?: (event: H3Event, subscription: SubscriptionNotification) => void | Promise<void>
}

interface SNSMessageOptions {
  onNotification?: (event: H3Event, notification: NotificationMessage) => void | Promise<void>
  onSubscribe?: (event: H3Event, subscribe: SubscriptionConfirmationMessage) => void | Promise<void>
  onUnsubscribe?: (event: H3Event, unsubscribe: UnsubscribeConfirmationMessage) => void | Promise<void>
}

interface SESEventHandlerOptions extends SESNotificationOptions, SNSMessageOptions {}

export function defineSESEventHandler({
  onBounce,
  onClick,
  onComplaint,
  onDelivery,
  onDeliveryDelay,
  onOpen,
  onReject,
  onRenderingFailure,
  onSend,
  onSubscription,
  onNotification,
  onSubscribe,
  onUnsubscribe,
}: SESEventHandlerOptions) {
  return defineEventHandler(async (event) => {
    const messageType = getHeader(event, 'x-amz-sns-message-type')

    if (messageType === 'SubscriptionConfirmation') {
      const body = await readBody<string>(event)
      const message = destr<SubscriptionConfirmationMessage>(body)

      await onSubscribe?.(event, message)

      // await verifyMessageSignature(message)

      const res = await $fetch(message.SubscribeURL, { method: 'GET' })
      console.log(res)
    }

    if (messageType === 'UnsubscribeConfirmation') {
      const body = await readBody<string>(event)
      const message = destr<UnsubscribeConfirmationMessage>(body)

      await onUnsubscribe?.(event, message)

      // await verifyMessageSignature(message)

      console.log(message)
    }

    if (messageType === 'Notification') {
      const body = await readBody<string>(event)
      const message = destr<NotificationMessage>(body)

      await onNotification?.(event, message)

      // await verifyMessageSignature(message)

      const notification = destr<Notification>(message.Message)

      switch (notification.eventType) {
        case 'Bounce':
          return onBounce?.(event, notification)
        case 'Click':
          return onClick?.(event, notification)
        case 'Complaint':
          return onComplaint?.(event, notification)
        case 'Delivery':
          return onDelivery?.(event, notification)
        case 'DeliveryDelay':
          return onDeliveryDelay?.(event, notification)
        case 'Open':
          return onOpen?.(event, notification)
        case 'Reject':
          return onReject?.(event, notification)
        case 'Rendering Failure':
          return onRenderingFailure?.(event, notification)
        case 'Send':
          return onSend?.(event, notification)
        case 'Subscription':
          return onSubscription?.(event, notification)
        default:
          throw createError({ statusCode: 400, statusMessage: `Unknown event type`, data: notification })
      }
    }
  })
}
