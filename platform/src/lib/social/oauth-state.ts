import { randomBytes } from 'crypto'
import { encrypt, decrypt } from './encryption'
import type { SocialPlatform } from './types'

const STATE_MAX_AGE_MS = 10 * 60 * 1000 // 10 minutes

export interface OAuthStatePayload {
  brandId: string
  userId: string
  platform: SocialPlatform
  nonce: string
  timestamp: number
}

export function createOAuthState(brandId: string, userId: string, platform: SocialPlatform): string {
  const payload: OAuthStatePayload = {
    brandId,
    userId,
    platform,
    nonce: randomBytes(16).toString('hex'),
    timestamp: Date.now(),
  }

  const json = JSON.stringify(payload)
  const encrypted = encrypt(json)
  const combined = JSON.stringify(encrypted)
  return Buffer.from(combined).toString('base64url')
}

export function parseOAuthState(state: string): OAuthStatePayload {
  let combined: string
  try {
    combined = Buffer.from(state, 'base64url').toString('utf8')
  } catch {
    throw new Error('Invalid OAuth state: malformed encoding')
  }

  let encrypted: { ciphertext: string; iv: string; authTag: string }
  try {
    encrypted = JSON.parse(combined)
  } catch {
    throw new Error('Invalid OAuth state: malformed structure')
  }

  let json: string
  try {
    json = decrypt(encrypted)
  } catch {
    throw new Error('Invalid OAuth state: decryption failed')
  }

  let payload: OAuthStatePayload
  try {
    payload = JSON.parse(json)
  } catch {
    throw new Error('Invalid OAuth state: malformed payload')
  }

  if (!payload.brandId || !payload.userId || !payload.platform || !payload.nonce || !payload.timestamp) {
    throw new Error('Invalid OAuth state: missing fields')
  }

  const age = Date.now() - payload.timestamp
  if (age > STATE_MAX_AGE_MS) {
    throw new Error('OAuth state expired')
  }

  return payload
}
