import { randomUUID } from 'uncrypto'
import type { MimePart } from '../types/email'
import type { ContentType } from '../types/email/content'

/**
 * Wrap a string to a maximum line length
 * @param part The MIME part to wrap
 * @param maxLength Maximum length of each line (default 76 for better compatibility)
 */
export function wrapContent(part: MimePart, maxLength = 76): string {
  if (!part.content) return part.content

  const chunks: string[] = []
  let currentLine = ''

  switch (part.headers['Content-Transfer-Encoding']) {
    // For base64, we need to ensure we wrap on base64 boundaries (4 characters)
    case 'base64': {
      const adjustedLength = Math.floor(maxLength / 4) * 4
      for (let i = 0; i < part.content.length; i += adjustedLength) {
        chunks.push(part.content.slice(i, i + adjustedLength))
      }
      return chunks.join('\r\n')
    }
    // For quoted-printable, we need to ensure we don't break encoded sequences
    case 'quoted-printable': {
      for (const word of part.content.split(/(?<=\s)/)) {
        if (currentLine.length + word.length > maxLength) {
          if (currentLine.endsWith('=')) {
            // If line ends with a quoted-printable escape, we need to add a soft line break
            chunks.push(currentLine + '=')
          }
          else {
            chunks.push(currentLine)
          }
          currentLine = word
        }
        else {
          currentLine += word
        }
      }
      if (currentLine) {
        chunks.push(currentLine)
      }
      return chunks.join('\r\n')
    }
    // For 7bit/8bit, we can do simple word wrapping
    case '7bit':
    case '8bit': {
      for (const word of part.content.split(/(?<=\s)/)) {
        if (currentLine.length + word.length > maxLength) {
          chunks.push(currentLine)
          currentLine = word
        }
        else {
          currentLine += word
        }
      }
      if (currentLine) {
        chunks.push(currentLine)
      }
      return chunks.join('\r\n')
    }
    default: {
      return part.content
    }
  }
}

export function contentTypeToValue(contentType: ContentType): string {
  return Object.entries(contentType)
    .map(([key, value]) => key === 'type' ? value : `${key}=${value}`)
    .join('; ')
}

export function createBoundary(type: 'mixed' | 'alternative' | 'related') {
  return `----=_Part_${type}_${randomUUID()}`
}

export function isInlinePart(part: MimePart): boolean {
  const headers = part.headers
  return headers['Content-Disposition'] === 'inline'
    && !!headers['Content-ID']
    && !headers['Content-Type'].includes('text/plain')
    && !headers['Content-Type'].includes('text/html')
}

export function isAttachmentPart(part: MimePart): boolean {
  const headers = part.headers
  return headers['Content-Disposition']?.startsWith('attachment')
    || (!headers['Content-Disposition']
      && !headers['Content-Type'].includes('text/plain')
      && !headers['Content-Type'].includes('text/html')
    )
}
