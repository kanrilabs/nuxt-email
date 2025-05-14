import type {
  RequiredHeaders,
  OptionalHeaders,
  ContentHeaders,
  MessageIdentificationHeaders,
  RoutingHeaders,
  ListHeaders,
  NotificationHeaders,
  PreferenceHeaders,
  MetadataHeaders,
} from './header'

/**
 * Standard email headers as defined in RFC 822 that are appropriate for user customization.
 */
export interface Headers extends
  RequiredHeaders,
  OptionalHeaders,
  MessageIdentificationHeaders,
  RoutingHeaders,
  ListHeaders,
  NotificationHeaders,
  PreferenceHeaders,
  MetadataHeaders {
  /**
   * Custom application-specific headers
   * @example 'X-My-Custom-Header: Some Value'
   */
  [key: `X-${string}`]: string | undefined
}

// Low-level MIME part interfaces
export interface MimePart {
  /**
   * The headers of the MIME part
   */
  headers: ContentHeaders
  /**
   * The actual content of the MIME part
   * For text/* types, this is the text content
   * For other types, this is typically base64 encoded content
   */
  content: string
}
