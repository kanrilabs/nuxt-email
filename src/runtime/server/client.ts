import { AwsClient } from 'aws4fetch'
import type { H3Event } from 'h3'
import type { MailConfig } from '../types/email'
import { MailBuilder } from './builder'

interface EmailClientOptions {
  region?: string
  endpoint?: string
  onSend?: (response: Response) => void
  onSendError?: (error: Error) => void
}

class EmailClient extends MailBuilder {
  #client: AwsClient
  #endpoint: string
  #opts: EmailClientOptions

  constructor(event: H3Event, config: MailConfig, opts?: EmailClientOptions) {
    super(config)

    const { accessKeyId, secretAccessKey, region } = useRuntimeConfig(event).mail
    this.#client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 'ses',
    })
    this.#endpoint = opts?.endpoint ?? `https://email.${opts?.region ?? region}.amazonaws.com/v2/email/outbound-emails`
    this.#opts = opts ?? {}
  }

  async send() {
    const content = this.build()
    try {
      const res = await this.#client.fetch(this.#endpoint, {
        body: JSON.stringify({ Content: { Raw: { Data: content } } }),
      })
      this.#opts.onSend?.(res.clone())
      return res.json()
    }
    catch (error) {
      if (error instanceof Error)
        this.#opts.onSendError?.(error)
      else
        this.#opts.onSendError?.(new Error(String(error)))

      console.error('Error sending email:', error)
    }
  }
}

export function useEmail(event: H3Event, config: MailConfig) {
  return new EmailClient(event, config)
}
