import type { MimeType } from '@uploadthing/mime-types'
import { randomUUID } from 'uncrypto'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import type { Header, MailConfig, MailHeader, MimePart, MultipartMime } from '../types/email'

/**
 * Mail builder
 *
 * @example
 * ```ts
 * const mail = new MailBuilder({
 *   from: { name: 'John Doe', email: 'john.doe@example.com' },
 *   to: { name: 'Jane Doe', email: 'jane.doe@example.com' },
 *   subject: 'Hello, world!',
 * })
 *   .addText('Hello, world!')
 *   .addHtml('<p>Hello, world!</p>')
 *   .addAttachment('example.txt', 'Hello, world!', 'text/plain')
 *   .addInlineImage('example.png', 'Hello, world!', 'image/png')
 *   .build();
 * ```
 */
export class MailBuilder {
  #headers: Map<Header, string>
  #content: MultipartMime
  #config: MailConfig

  constructor(config: MailConfig) {
    this.#config = config
    this.#headers = new Map<Header, string>([
      ['Date', new Date().toISOString()],
      ['From', `"${config.from.name}" <${config.from.email}>`],
      ['To', Array.isArray(config.to) ? config.to.map(to => `"${to.name}" <${to.email}>`).join(', ') : `"${config.to.name}" <${config.to.email}>`],
      ['Subject', config.subject],
    ])

    this.#content = {
      type: 'multipart',
      subtype: 'mixed',
      parts: [],
    }
  }

  /**
   * Add a plain text version of the email
   * @param text - The text content of the email
   * @returns The MailBuilder instance
   */
  addText(text: string, config?: { contentTransferEncoding?: 'quoted-printable' | 'base64' | '7bit' }) {
    const textPart: MimePart = {
      contentType: 'text/plain',
      contentTransferEncoding: config?.contentTransferEncoding ?? 'quoted-printable',
      content: text,
    }
    this.ensureAlternative().parts.push(textPart)
    return this
  }

  /**
   * Add an HTML version of the email
   * @param html - The HTML content of the email
   * @returns The MailBuilder instance
   */
  addHtml(html: string, config?: { contentTransferEncoding?: 'quoted-printable' | 'base64' | '7bit' }) {
    const htmlPart: MimePart = {
      contentType: 'text/html',
      contentTransferEncoding: config?.contentTransferEncoding ?? 'quoted-printable',
      content: html,
    }
    this.ensureAlternative().parts.push(htmlPart)
    return this
  }

  /**
   * Add an attachment to the email
   * @param filename - The filename of the attachment
   * @param content - The content of the attachment
   * @param mimeType - The MIME type of the attachment
   * @returns The MailBuilder instance
   */
  addAttachment(filename: string, content: string, mimeType: MimeType) {
    const attachment: MimePart = {
      contentType: mimeType,
      contentTransferEncoding: 'base64',
      contentDisposition: `attachment; filename="${filename}"`,
      content,
    }
    this.#content.parts.push(attachment)
    return this
  }

  /**
   * Add an inline image to the email
   * @param cid - The Content-ID of the image
   * @param content - The content of the image
   * @param mimeType - The MIME type of the image
   * @returns The MailBuilder instance
   */
  addInlineImage(cid: string, content: string, mimeType: MimeType) {
    const image: MimePart = {
      contentType: mimeType,
      contentTransferEncoding: 'base64',
      contentId: `<${cid}>`,
      contentDisposition: 'inline',
      content,
    }
    this.ensureRelated().parts.push(image)
    return this
  }

  private ensureAlternative(): MultipartMime {
    let alternative = this.#content.parts.find(part =>
      'type' in part && part.type === 'multipart' && part.subtype === 'alternative',
    ) as MultipartMime | undefined

    if (!alternative) {
      alternative = {
        type: 'multipart',
        subtype: 'alternative',
        parts: [],
      }
      this.#content.parts.unshift(alternative)
    }

    return alternative
  }

  private ensureRelated(): MultipartMime {
    const alternative = this.ensureAlternative()
    let related = alternative.parts.find(part =>
      'type' in part && part.type === 'multipart' && part.subtype === 'related',
    ) as MultipartMime | undefined

    if (!related) {
      related = {
        type: 'multipart',
        subtype: 'related',
        parts: [],
      }
      alternative.parts.push(related)
    }

    return related
  }

  /**
   * Add a header to the email. Calling this method will override any existing header with the same name.
   * @param header - The header to add
   * @returns The MailBuilder instance
   */
  addHeader(header: MailHeader) {
    this.#headers.set(header.name, header.value)
    return this
  }

  /**
   * Build the final raw email
   * @returns The raw email content
   */
  raw(): string {
    this.addHeader({ name: 'MIME-Version', value: '1.0' })
    const headers = Array.from(this.#headers.entries()).map(([name, value]) => `${name}: ${value}`).join('\n')
    const body = renderMimeParts(this.#content)
    return `${headers}\n${body}`
  }

  /**
   * Pretty print the raw email
   */
  pretty() {
    this.addHeader({ name: 'MIME-Version', value: '1.0' })
    this.#headers.forEach((value, key) => {
      consola.log(`${colors.bold(key)}: ${value}`)
    })

    printMimePart(this.#content)
  }

  /**
   * Build the final email
   * @returns The final email as a base64 encoded string
   */
  build(): string {
    return btoa(this.raw())
  }

  get to() {
    return this.#config.to
  }

  get from() {
    return this.#config.from
  }

  get subject() {
    return this.#config.subject
  }
}

function isMultipart(part: MimePart | MultipartMime): part is MultipartMime {
  return 'type' in part && part.type === 'multipart'
}

function printMimePart(part: MimePart | MultipartMime) {
  if (isMultipart(part)) {
    const boundary = createBoundary(part.subtype)
    const boundaryColor = {
      mixed: colors.redBright,
      alternative: colors.blueBright,
      related: colors.greenBright,
    } satisfies Record<MultipartMime['subtype'], typeof colors[keyof typeof colors]>

    consola.log(boundaryColor[part.subtype](`Content-Type: multipart/${part.subtype}; boundary="${boundary}"`))
    consola.log('')
    part.parts.forEach((p) => {
      consola.log(boundaryColor[part.subtype](colors.bold(`--${boundary}`)))
      printMimePart(p)
    })
    consola.log(boundaryColor[part.subtype](colors.bold(`--${boundary}--`)))
    consola.log('')
  }

  if (!isMultipart(part)) {
    consola.box(colors.reset([
      `${colors.bold('Content-Type:')} ${part.contentType}; charset=UTF-8`,
      part.contentTransferEncoding && `${colors.bold('Content-Transfer-Encoding:')} ${part.contentTransferEncoding}`,
      part.contentDisposition && `${colors.bold('Content-Disposition:')} ${part.contentDisposition}`,
      part.contentId && `${colors.bold('Content-ID:')} ${part.contentId}`,
      '',
      part.content,
    ].filter(Boolean).join('\n')))
  }
}

// Low-level MIME parts renderer
function renderMimeParts(part: MimePart | MultipartMime): string {
  if (isMultipart(part)) {
    const boundary = createBoundary(part.subtype)
    const renderedParts = part.parts.map(p => renderMimeParts(p))

    return [
      `Content-Type: multipart/${part.subtype}; boundary="${boundary}"`,
      '',
      ...renderedParts.map(p => `--${boundary}\n${p}\n`),
      `--${boundary}--`,
    ].join('\n')
  }

  return [
    `Content-Type: ${part.contentType}; charset=UTF-8`,
    part.contentTransferEncoding && `Content-Transfer-Encoding: ${part.contentTransferEncoding}`,
    part.contentDisposition && `Content-Disposition: ${part.contentDisposition}`,
    part.contentId && `Content-ID: ${part.contentId}`,
    '',
    part.content,
  ].filter(s => s !== undefined).join('\n')
}

// Create a boundary for multipart emails
function createBoundary(type: 'mixed' | 'alternative' | 'related') {
  return `----=_Part_${type}_${randomUUID()}`
}
