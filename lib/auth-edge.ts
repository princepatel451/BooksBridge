export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

function decodePayload(payloadB64: string): JWTPayload {
  const bytes = base64urlDecode(payloadB64)
  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(bytes))
}

export async function verifyTokenEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const signature = base64urlDecode(signatureB64)

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signature as any,
      data as any
    )

    if (!isValid) return null

    const payload = decodePayload(payloadB64)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    return payload
  } catch (err) {
    console.error('Edge token verification failed:', err)
    return null
  }
}
