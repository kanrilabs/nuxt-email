import { AwsClient } from 'aws4fetch'
import { type H3Event, createError } from 'h3'
import type { Headers, MimePart } from '../types/email'
import { buildMessage } from './mesage'
import { useRuntimeConfig } from '#imports'

interface EmailClientOptions {
  region?: string
  endpoint?: string
}

interface SendResponse {
  MessageId: string
}

interface SendOptions {
  onSend?: (data: SendResponse) => void
  onSendError?: (error: Error) => void
}

class EmailClient {
  #client: AwsClient
  #endpoint: string

  constructor(event: H3Event, opts?: EmailClientOptions) {
    const { accessKeyId, secretAccessKey, region } = useRuntimeConfig(event).email
    this.#client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 'ses',
    })
    this.#endpoint = opts?.endpoint ?? `https://email.${opts?.region ?? region}.amazonaws.com/v2/email/outbound-emails`
  }

  async send(message: string, opts?: SendOptions) {
    try {
      const res = await this.#client.fetch(this.#endpoint, {
        body: JSON.stringify({ Content: { Raw: { Data: btoa(message) } } }),
      })
      const data = await res.json()

      if (data.MessageId) {
        opts?.onSend?.(data as SendResponse)
        return data as SendResponse
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email',
        message: data.message,
        data,
      })
    }
    catch (error) {
      if (error instanceof Error)
        opts?.onSendError?.(error)
      else
        opts?.onSendError?.(new Error(String(error)))

      console.error('Error sending email:', error)
    }
  }

  /**
   * Build an email message from headers and content parts.
   * Automatically determines if multipart is needed based on the parts.
   * Does all the boundary handling for you.
   *
   * @example
   * // Simple text email
   * message({
   *   From: '"My Name" <me@example.com>',
   *   To: 'you@example.com',
   *   Subject: 'Hello'
   * }, [
   *   { 'Content-Type': 'text/plain; charset=utf-8', content: 'Hello World' }
   * ])
   *
   * @example
   * // HTML email with text alternative
   * message({
   *   From: '"My Name" <me@example.com>',
   *   To: 'you@example.com',
   *   Subject: 'Hello'
   * }, [
   *   { 'Content-Type': 'text/plain; charset=utf-8', content: 'Hello World' },
   *   { 'Content-Type': 'text/html; charset=utf-8', content: '<h1>Hello World</h1>' }
   * ])
   *
   * @example
   * // HTML email with inline image
   * message({
   *   From: '"My Name" <me@example.com>',
   *   To: 'you@example.com',
   *   Subject: 'Hello'
   * }, [
   *   { 'Content-Type': 'text/html; charset=utf-8', content: '<img src="cid:image1" />Hello World</>' },
   *   { 'Content-Type': 'image/png; name=image1.png', 'Content-ID': '<image1>', content: '...' }
   * ])
   *
   * @example
   * // HTML email with text alternative and attachments
   * message({
   *   From: '"My Name" <me@example.com>',
   *   To: 'you@example.com',
   *   Subject: 'Hello'
   * }, [
   *   { 'Content-Type': 'text/plain; charset=utf-8', content: 'Hello World' },
   *   { 'Content-Type': 'text/html; charset=utf-8', content: '<h1>Hello World</h1>' },
   *   { 'Content-Type': 'application/pdf; name=document.pdf', 'Content-Disposition': 'attachment', content: '...' }
   * ])
   */
  public message(headers: Headers, parts: MimePart[]): string {
    return buildMessage(headers, parts)
  }
}

export function useEmail(event: H3Event, opts?: EmailClientOptions) {
  return new EmailClient(event, opts)
}
