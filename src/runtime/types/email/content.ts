import type { MimeType } from '@uploadthing/mime-types'

export type Charset = 'utf-8' | 'ascii' | 'iso-8859-1' | 'utf-16' | 'utf-32'
export type Format = 'fixed' | 'flowed'
export type Protocol = 'http' | 'https' | 'ftp' | 'mailto' | 'cid'
export type AccessType = 'public' | 'private' | 'partial'
export type Purpose = 'preview' | 'icon' | 'thumbnail'
export type ReportType = 'delivery-status' | 'disposition-notification' | 'feedback-report'
export type Disposition = 'inline' | 'attachment'
export type Importance = 'low' | 'normal' | 'high'
export type Priority = 'non-urgent' | 'normal' | 'urgent'
export type Sensitivity = 'personal' | 'private' | 'company-confidential'

export interface ContentType {
  /**
   * The MIME type of the content
   * @example 'text/plain'
   * @example 'image/jpeg'
   */
  type: MimeType
  /**
   * The character set of the content
   */
  charset?: Charset
  /**
   * The format of the content
   * @example 'fixed' - Standard fixed-width formatting
   * @example 'flowed' - Format=Flowed (RFC 3676) formatting
   */
  format?: Format
  /**
   * The name of the content
   * @example 'photo.jpg'
   */
  name?: string
  /**
   * The protocol of the content
   * @example 'http' - HTTP protocol
   * @example 'cid' - Content-ID reference
   * @example 'mailto' - Email address reference
   */
  protocol?: Protocol
  /**
   * The access type of the content
   * @example 'public' - Publicly accessible content
   * @example 'private' - Private content
   * @example 'partial' - Partially accessible content
   */
  accessType?: AccessType
  /**
   * The purpose of the content
   * @example 'preview' - Content is a preview
   * @example 'icon' - Content is an icon
   * @example 'thumbnail' - Content is a thumbnail
   */
  purpose?: Purpose
  /**
   * The type of report for message/report content types
   * @example 'delivery-status' - Delivery Status Notification
   * @example 'disposition-notification' - Message Disposition Notification
   * @example 'feedback-report' - Abuse Report
   */
  reportType?: ReportType
  /**
   * How the content should be displayed
   * @example 'inline' - Display content inline
   * @example 'attachment' - Handle as attachment
   */
  disposition?: Disposition
  /**
   * The importance level of the content
   * @example 'low' - Low importance
   * @example 'normal' - Normal importance
   * @example 'high' - High importance
   */
  importance?: Importance
  /**
   * The priority level of the content
   * @example 'non-urgent' - Non-urgent priority
   * @example 'normal' - Normal priority
   * @example 'urgent' - Urgent priority
   */
  priority?: Priority
  /**
   * The sensitivity level of the content
   * @example 'personal' - Personal content
   * @example 'private' - Private content
   * @example 'company-confidential' - Company confidential content
   */
  sensitivity?: Sensitivity
  /**
   * The expiration of the content
   * @example '1234567890'
   */
  expiration?: string
  /**
   * The size of the content in bytes
   * @example 1234567890
   */
  size?: number
  /**
   * The boundary string for multipart messages
   * @example 'boundary-123456'
   */
  boundary?: string
  /**
   * A descriptive title for the content
   * @example 'Monthly Report'
   */
  title?: string
  /**
   * The S/MIME type for encrypted messages
   * @example 'enveloped-data'
   * @example 'signed-data'
   */
  smimeType?: string
  /**
   * The S/MIME protocol version
   * @example '1.0'
   */
  smimeProtocol?: string
  /**
   * The padding size in bytes
   * @example 4096
   */
  padding?: number
  /**
   * The content level specification
   * @example 'basic'
   * @example 'advanced'
   */
  level?: string
  /**
   * The delta encoding differences specification
   * @example 'gdiff'
   */
  differences?: string
  [key: string]: string | number | undefined
}
