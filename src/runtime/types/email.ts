import type { MimeType } from '@uploadthing/mime-types'

export const headers = [
  'Date',
  'From',
  'To',
  'Subject',
  'Reply-To',
  'Cc',
  'Bcc',
  'Priority',
  'Importance',
] as const
export type Header = typeof headers[number] | string & {}

export interface Address {
  name: string
  email: string
}

export type Priority = 'normal' | 'non-urgent' | 'urgent'
export type Importance = 'low' | 'normal' | 'high'

export interface MailConfig {
  from: Address
  to: Address | Address[]
  subject: string
}

interface PriorityHeader {
  name: 'Priority'
  value: Priority
}

interface ImportanceHeader {
  name: 'Importance'
  value: Importance
}

interface BaseHeader {
  name: Header
  value: string
}

export type MailHeader = BaseHeader | PriorityHeader | ImportanceHeader

// Low-level MIME part interfaces
export interface MimePart {
  contentType: MimeType
  contentTransferEncoding?: 'quoted-printable' | 'base64' | '7bit'
  contentDisposition?: string
  contentId?: string
  content: string
}

export interface MultipartMime {
  type: 'multipart'
  subtype: 'mixed' | 'alternative' | 'related'
  parts: (MimePart | MultipartMime)[]
}
