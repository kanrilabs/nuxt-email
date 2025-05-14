// Minimal ASN.1 parser to extract SPKI from X.509 cert
export function extractSpkiFromCert(der: Uint8Array): Uint8Array {
  // X.509 Certificate ASN.1 structure:
  // Certificate  ::=  SEQUENCE  {
  //      tbsCertificate       TBSCertificate,
  //      signatureAlgorithm   AlgorithmIdentifier,
  //      signatureValue       BIT STRING  }
  //
  // TBSCertificate  ::=  SEQUENCE  {
  //      ...,
  //      subjectPublicKeyInfo SubjectPublicKeyInfo,
  //      ... }
  //
  // We'll look for the SEQUENCE that is the subjectPublicKeyInfo.

  // Helper to read ASN.1 length
  function readLength(bytes: Uint8Array, offset: number): [number, number] {
    let len = bytes[offset++]
    if (len & 0x80) {
      const n = len & 0x7F
      len = 0
      for (let i = 0; i < n; ++i) {
        len = (len << 8) | bytes[offset++]
      }
    }
    return [len, offset]
  }

  // Helper to skip ASN.1 element
  function skipElement(bytes: Uint8Array, offset: number): number {
    // Skip tag
    offset++
    // Read length
    const [len, next] = readLength(bytes, offset)
    return next + len
  }

  // Parse the top-level SEQUENCE (the certificate)
  let offset = 0
  if (der[offset++] !== 0x30) throw new Error('Not a SEQUENCE')
  const [_certLen, certStart] = readLength(der, offset)
  offset = certStart

  // Parse tbsCertificate (first element, SEQUENCE)
  if (der[offset++] !== 0x30) throw new Error('Not a SEQUENCE')
  const [_tbsLen, tbsStart] = readLength(der, offset)
  let tbsOffset = tbsStart

  // Now, walk through tbsCertificate fields to find subjectPublicKeyInfo
  // The number of fields before subjectPublicKeyInfo can vary (due to optional fields),
  // so we need to walk through the fields.

  // We'll look for the SEQUENCE tag (0x30) that is the subjectPublicKeyInfo,
  // which is always after the subject (another SEQUENCE).

  // We'll do a simple scan for the SEQUENCE that is the public key info.
  // This is not a robust parser, but works for most certs.

  // Skip version (optional, [0] EXPLICIT)
  if (der[tbsOffset] === 0xA0) {
    tbsOffset = skipElement(der, tbsOffset)
  }
  // serialNumber
  tbsOffset = skipElement(der, tbsOffset)
  // signature
  tbsOffset = skipElement(der, tbsOffset)
  // issuer
  tbsOffset = skipElement(der, tbsOffset)
  // validity
  tbsOffset = skipElement(der, tbsOffset)
  // subject
  tbsOffset = skipElement(der, tbsOffset)

  // Now at subjectPublicKeyInfo (SEQUENCE)
  if (der[tbsOffset] !== 0x30) throw new Error('Expected SEQUENCE for subjectPublicKeyInfo')
  const spkiStart = tbsOffset
  const [spkiLen, spkiContentStart] = readLength(der, tbsOffset + 1)
  const spkiEnd = spkiContentStart + spkiLen
  return der.slice(spkiStart, spkiEnd)
}
