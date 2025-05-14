import { createError } from 'h3'
import { subtle } from 'uncrypto'
import type { Message } from '../../types/sns/message'
import { extractSpkiFromCert } from './certificate'

/**
 * // FIXME: I just can't get this to work.
 * @see https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message-verify-message-signature.html
 */

export async function verifyMessageSignature(message: Message) {
  const signingURL = new URL(message.SigningCertURL)
  if (!signingURL.host.includes('amazonaws.com') || signingURL.protocol !== 'https:')
    throw createError({ statusCode: 403, statusMessage: 'Untrusted certificate URL' })

  // Fetch pem encoded certificate
  const response = await $fetch<Blob>(message.SigningCertURL, {
    method: 'GET',
    onResponseError: () => {
      throw createError({ statusCode: 403, statusMessage: 'Failed to fetch certificate' })
    },
  })
  const cert = await response.text()

  // Create string to sign
  const canonicalString = getFieldsToSign(message.Type)
    .map(field => `${field}\n${message[field as keyof Message]}`)
    .join('\n')

  // Verify signature
  const key = await importKey(cert, message.SignatureVersion)
  const signature = base64ToUint8Array(message.Signature)
  const data = new TextEncoder().encode(canonicalString)
  const verified = await subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, signature, data)

  console.dir(message, { depth: null })
  console.log('canonicalString\n', canonicalString)
  console.log('verified', verified)

  if (!verified)
    throw createError({ statusCode: 403, statusMessage: 'Invalid message signature' })
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function importKey(pem: string, signatureVersion: '1' | '2'): Promise<CryptoKey> {
  const contents = pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\s+/g, '')
  const certDer = base64ToUint8Array(contents)
  const keyDer = extractSpkiFromCert(certDer)

  return subtle.importKey(
    'spki',
    keyDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: signatureVersion === '1' ? 'SHA-1' : 'SHA-256',
    },
    false,
    ['verify'],
  )
}

function getFieldsToSign(type: string): string[] {
  switch (type) {
    case 'SubscriptionConfirmation':
    case 'UnsubscribeConfirmation':
      return ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type']
    case 'Notification':
      return ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type']
    default:
      throw createError({ statusCode: 400, statusMessage: `Unknown message type: ${type}` })
  }
}
