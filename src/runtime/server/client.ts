import { AwsClient } from 'aws4fetch'
import type { H3Event } from 'h3'
import type { MailConfig } from '../types/email'
import { MailBuilder } from './builder'

class EmailClient extends MailBuilder {
  #client: AwsClient
  #endpoint: string

  constructor(event: H3Event, config: MailConfig) {
    super(config)

    const { accessKeyId, secretAccessKey, region } = useRuntimeConfig(event).mail
    this.#client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 'ses',
    })
    this.#endpoint = `https://email.${region}.amazonaws.com/v2/email/outbound-emails`
  }

  async send() {
    const content = this.build()
    try {
      const res = await this.#client.fetch(this.#endpoint, {
        body: JSON.stringify({ Content: { Raw: { Data: content } } }),
      })
      return res.json()
    }
    catch (error) {
      console.error('Error sending email:', error)
    }
  }
}

export function useEmail(event: H3Event, config: MailConfig) {
  return new EmailClient(event, config)
}
