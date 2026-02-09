import type { OAuthTokens, SocialPlatform } from './types'
import { getProvider } from './registry'
import {
  getSocialToken,
  decryptAccessToken,
  decryptRefreshToken,
  updateSocialTokens,
  updateConnectionTokenStatus,
} from '@/models/social-connection'

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000 // Refresh 5 min before expiry

export async function getValidTokens(
  brandId: string,
  platform: SocialPlatform,
  accountId: string
): Promise<OAuthTokens | null> {
  const stored = await getSocialToken(brandId, platform, accountId)
  if (!stored) return null

  const accessToken = decryptAccessToken(stored)
  const refreshToken = decryptRefreshToken(stored)

  // Check if token is still valid
  if (stored.expiresAt && stored.expiresAt.getTime() - Date.now() < TOKEN_REFRESH_BUFFER_MS) {
    // Token expired or about to expire — try refresh
    if (!refreshToken) {
      await updateConnectionTokenStatus(brandId, platform, accountId, 'expired')
      return null
    }

    try {
      const provider = getProvider(platform)
      const newTokens = await provider.refreshAccessToken(refreshToken)

      await updateSocialTokens(brandId, platform, accountId, newTokens)
      await updateConnectionTokenStatus(brandId, platform, accountId, 'active')

      return newTokens
    } catch {
      await updateConnectionTokenStatus(brandId, platform, accountId, 'expired')
      return null
    }
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: stored.expiresAt,
    scope: stored.scope,
    tokenType: 'bearer',
  }
}
