import type { Headers, MimePart } from '../types/email'
import {
  createBoundary,
  wrapContent,
  isInlinePart,
  isAttachmentPart,
} from './utils'

/**
 * Render headers as a string
 */
function renderHeaders(headers: Headers): string {
  return Object.entries(headers)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n') + '\r\n'
}

/**
 * Render content headers for a MIME part
 */
function renderContentHeaders(part: MimePart): string {
  return Object.entries(part.headers)
    .filter(([key, value]) => key !== 'content' && value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n')
}

/**
 * Render a single part (non-multipart) message
 */
function renderSinglePart(part: MimePart): string {
  return `${renderContentHeaders(part)}\r\n\r\n${wrapContent(part)}`
}

/**
 * Render a multipart/alternative message (text + html)
 */
function renderAlternative(textPart: MimePart, htmlContent: string): string {
  const boundary = createBoundary('alternative')
  return [
    `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`,
    `--${boundary}\r\n${renderContentHeaders(textPart)}\r\n\r\n${wrapContent(textPart)}\r\n`,
    `--${boundary}\r\n${htmlContent}\r\n`,
    `--${boundary}--`,
  ].join('\r\n')
}

/**
 * Render a multipart/related message (html + inline images)
 */
function renderRelated(htmlPart: MimePart, inlineParts: MimePart[]): string {
  const boundary = createBoundary('related')
  return [
    `Content-Type: multipart/related; boundary="${boundary}"\r\n`,
    `--${boundary}\r\n${renderContentHeaders(htmlPart)}\r\n\r\n${wrapContent(htmlPart)}\r\n`,
    ...inlineParts.map(part => `--${boundary}\r\n${renderContentHeaders(part)}\r\n\r\n${wrapContent(part)}\r\n`),
    `--${boundary}--`,
  ].join('\r\n')
}

/**
 * Render a multipart/mixed message (with attachments)
 */
function renderMixed(mainContent: string, attachments: MimePart[]): string {
  const boundary = createBoundary('mixed')
  return [
    `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`,
    `--${boundary}\r\n${mainContent}\r\n`,
    ...attachments.map(part => `--${boundary}\r\n${renderContentHeaders(part)}\r\n\r\n${wrapContent(part)}\r\n`),
    `--${boundary}--`,
  ].join('\r\n')
}

/**
 * Build an email message from headers and content parts.
 * Automatically determines if multipart is needed based on the parts.
 * Does all the boundary handling for you.
 * Returns the raw message string ready to be sent.
 *
 * Note: This is a low-level API. The user is responsible for setting all headers on both the main message and individual MIME parts.
 */
export function buildMessage(headers: Headers, parts: MimePart[]): string {
  if (!headers.From) throw new Error('From header is required')
  if (!headers.To) throw new Error('To header is required')
  if (!headers.Subject) throw new Error('Subject header is required')
  if (!parts.length) throw new Error('At least one content part is required')

  // Four main part types
  const textPart = parts.find(part => part.headers['Content-Type'].includes('text/plain'))
  const htmlPart = parts.find(part => part.headers['Content-Type'].includes('text/html'))
  const inlineParts = parts.filter(isInlinePart)
  const attachments = parts.filter(isAttachmentPart)

  // Headers are the same whatever the content may be
  const mailHeaders = renderHeaders({
    ...headers,
    'MIME-Version': '1.0',
  } as Headers)
  let content = ''

  // Build the content from inside out
  if (htmlPart) {
    // If we have inline parts, wrap HTML in multipart/related first
    if (inlineParts.length > 0) {
      content = renderRelated(htmlPart, inlineParts)
    }
    else {
      content = renderSinglePart(htmlPart)
    }

    // If we have text, wrap everything in multipart/alternative
    if (textPart) {
      content = renderAlternative(textPart, content)
    }
  }
  else if (textPart) {
    content = renderSinglePart(textPart)
  }
  else {
    content = renderSinglePart(parts[0])
  }

  // If we have attachments, wrap everything in multipart/mixed
  if (attachments.length > 0) {
    return mailHeaders + renderMixed(content, attachments)
  }

  return mailHeaders + content
}
