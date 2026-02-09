import { collections, FieldValue } from '@/lib/firebase'
import { encrypt, decrypt } from '@/lib/social/encryption'
import type { SocialPlatform, OAuthTokens, SocialAccountInfo, StoredSocialToken, OAuthPendingEntry } from '@/lib/social/types'
import type { SocialConnection } from '@/types'

// --- Token Storage ---

function tokenDocId(brandId: string, platform: SocialPlatform, accountId: string): string {
  return `${brandId}_${platform}_${accountId}`
}

export async function storeSocialToken(
  brandId: string,
  platform: SocialPlatform,
  tokens: OAuthTokens,
  accountInfo: SocialAccountInfo,
  connectedBy: string
): Promise<void> {
  const docId = tokenDocId(brandId, platform, accountInfo.accountId)

  const accessEncrypted = encrypt(tokens.accessToken)
  const refreshEncrypted = tokens.refreshToken ? encrypt(tokens.refreshToken) : null

  await collections.socialTokens.doc(docId).set({
    brandId,
    platform,
    accountId: accountInfo.accountId,
    encryptedAccessToken: accessEncrypted.ciphertext,
    encryptedRefreshToken: refreshEncrypted?.ciphertext ?? null,
    iv: accessEncrypted.iv,
    authTag: accessEncrypted.authTag,
    refreshIv: refreshEncrypted?.iv ?? null,
    refreshAuthTag: refreshEncrypted?.authTag ?? null,
    expiresAt: tokens.expiresAt ?? null,
    scope: tokens.scope,
    connectedBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function getSocialToken(
  brandId: string,
  platform: SocialPlatform,
  accountId: string
): Promise<StoredSocialToken | null> {
  const docId = tokenDocId(brandId, platform, accountId)
  const doc = await collections.socialTokens.doc(docId).get()

  if (!doc.exists) return null

  const data = doc.data()!
  return {
    brandId: data.brandId,
    platform: data.platform,
    accountId: data.accountId,
    encryptedAccessToken: data.encryptedAccessToken,
    encryptedRefreshToken: data.encryptedRefreshToken,
    iv: data.iv,
    authTag: data.authTag,
    refreshIv: data.refreshIv ?? null,
    refreshAuthTag: data.refreshAuthTag ?? null,
    expiresAt: data.expiresAt?.toDate?.() ?? null,
    scope: data.scope,
    connectedBy: data.connectedBy,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export function decryptAccessToken(stored: StoredSocialToken): string {
  return decrypt({
    ciphertext: stored.encryptedAccessToken,
    iv: stored.iv,
    authTag: stored.authTag,
  })
}

export function decryptRefreshToken(stored: StoredSocialToken): string | null {
  if (!stored.encryptedRefreshToken) return null
  if (!stored.refreshIv || !stored.refreshAuthTag) return null

  return decrypt({
    ciphertext: stored.encryptedRefreshToken,
    iv: stored.refreshIv,
    authTag: stored.refreshAuthTag,
  })
}

export async function updateSocialTokens(
  brandId: string,
  platform: SocialPlatform,
  accountId: string,
  tokens: OAuthTokens
): Promise<void> {
  const docId = tokenDocId(brandId, platform, accountId)
  const accessEncrypted = encrypt(tokens.accessToken)
  const refreshEncrypted = tokens.refreshToken ? encrypt(tokens.refreshToken) : null

  await collections.socialTokens.doc(docId).update({
    encryptedAccessToken: accessEncrypted.ciphertext,
    encryptedRefreshToken: refreshEncrypted?.ciphertext ?? null,
    iv: accessEncrypted.iv,
    authTag: accessEncrypted.authTag,
    refreshIv: refreshEncrypted?.iv ?? null,
    refreshAuthTag: refreshEncrypted?.authTag ?? null,
    expiresAt: tokens.expiresAt ?? null,
    scope: tokens.scope,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function deleteSocialToken(
  brandId: string,
  platform: SocialPlatform,
  accountId: string
): Promise<void> {
  const docId = tokenDocId(brandId, platform, accountId)
  await collections.socialTokens.doc(docId).delete()
}

// --- Brand socialConnections[] helpers ---

export async function addSocialConnection(
  brandId: string,
  platform: SocialPlatform,
  accountInfo: SocialAccountInfo,
  connectedBy: string
): Promise<void> {
  const connection: Record<string, unknown> = {
    platform,
    accountId: accountInfo.accountId,
    accountName: accountInfo.accountName,
    displayName: accountInfo.displayName ?? null,
    profileUrl: accountInfo.profileUrl ?? null,
    avatarUrl: accountInfo.avatarUrl ?? null,
    enabled: true,
    connectedBy,
    connectedAt: FieldValue.serverTimestamp(),
    tokenStatus: 'active',
  }

  const docRef = collections.brands.doc(brandId)
  const doc = await docRef.get()
  if (!doc.exists) throw new Error('Brand not found')

  const data = doc.data()!
  const existing = (data.socialConnections || []) as Record<string, unknown>[]

  // Remove any existing connection for this platform+accountId
  const filtered = existing.filter(
    (sc) => !(sc.platform === platform && sc.accountId === accountInfo.accountId)
  )
  filtered.push(connection)

  await docRef.update({
    socialConnections: filtered,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function removeSocialConnection(
  brandId: string,
  platform: SocialPlatform,
  accountId: string
): Promise<void> {
  const docRef = collections.brands.doc(brandId)
  const doc = await docRef.get()
  if (!doc.exists) throw new Error('Brand not found')

  const data = doc.data()!
  const existing = (data.socialConnections || []) as Record<string, unknown>[]
  const filtered = existing.filter(
    (sc) => !(sc.platform === platform && sc.accountId === accountId)
  )

  await docRef.update({
    socialConnections: filtered,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function toggleSocialConnection(
  brandId: string,
  platform: SocialPlatform,
  accountId: string,
  enabled: boolean
): Promise<void> {
  const docRef = collections.brands.doc(brandId)
  const doc = await docRef.get()
  if (!doc.exists) throw new Error('Brand not found')

  const data = doc.data()!
  const connections = (data.socialConnections || []) as Record<string, unknown>[]
  const updated = connections.map((sc) => {
    if (sc.platform === platform && sc.accountId === accountId) {
      return { ...sc, enabled }
    }
    return sc
  })

  await docRef.update({
    socialConnections: updated,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function updateConnectionTokenStatus(
  brandId: string,
  platform: SocialPlatform,
  accountId: string,
  tokenStatus: SocialConnection['tokenStatus']
): Promise<void> {
  const docRef = collections.brands.doc(brandId)
  const doc = await docRef.get()
  if (!doc.exists) return

  const data = doc.data()!
  const connections = (data.socialConnections || []) as Record<string, unknown>[]
  const updated = connections.map((sc) => {
    if (sc.platform === platform && sc.accountId === accountId) {
      return { ...sc, tokenStatus }
    }
    return sc
  })

  await docRef.update({
    socialConnections: updated,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export function getConnectionsForBrand(brand: { socialConnections: SocialConnection[] }): SocialConnection[] {
  return brand.socialConnections || []
}

// --- OAuth Pending (PKCE) ---

export async function storeOAuthPending(
  stateNonce: string,
  entry: Omit<OAuthPendingEntry, 'createdAt'>
): Promise<void> {
  await collections.oauthPending.doc(stateNonce).set({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  })
}

export async function getOAuthPending(stateNonce: string): Promise<OAuthPendingEntry | null> {
  const doc = await collections.oauthPending.doc(stateNonce).get()
  if (!doc.exists) return null

  const data = doc.data()!
  return {
    codeVerifier: data.codeVerifier,
    brandId: data.brandId,
    platform: data.platform,
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

export async function deleteOAuthPending(stateNonce: string): Promise<void> {
  await collections.oauthPending.doc(stateNonce).delete()
}
