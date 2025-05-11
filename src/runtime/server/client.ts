import { AwsClient } from 'aws4fetch'
import type { H3Event } from 'h3'
import { MailBuilder, type MailConfig } from './builder'

const AWS_SES_ENDPOINT = 'https://email.us-east-1.amazonaws.com/v2/email/outbound-emails'

class EmailClient extends MailBuilder {
  #client: AwsClient

  constructor(event: H3Event, config: MailConfig) {
    super(config)

    const { accessKeyId, secretAccessKey } = useRuntimeConfig(event).mail
    this.#client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 'ses',
    })
  }

  async send() {
    const content = this.build()
    try {
      const res = await this.#client.fetch(AWS_SES_ENDPOINT, {
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
