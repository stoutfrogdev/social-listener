export type SocialPlatform = 'twitter' | 'linkedin' | 'reddit'

export interface OAuthTokens {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  scope: string
  tokenType: string
}

export interface SocialAccountInfo {
  accountId: string
  accountName: string
  displayName?: string
  profileUrl?: string
  avatarUrl?: string
}

export interface SocialProvider {
  platform: SocialPlatform
  displayName: string
  scopes: string[]
  getAuthorizationUrl: (state: string, redirectUri: string) => string | Promise<string>
  exchangeCodeForTokens: (code: string, redirectUri: string, extras?: Record<string, string>) => Promise<OAuthTokens>
  getAccountInfo: (tokens: OAuthTokens) => Promise<SocialAccountInfo>
  refreshAccessToken: (refreshToken: string) => Promise<OAuthTokens>
  revokeAccess: (tokens: OAuthTokens) => Promise<void>
}

export interface StoredSocialToken {
  brandId: string
  platform: SocialPlatform
  accountId: string
  encryptedAccessToken: string
  encryptedRefreshToken: string | null
  iv: string
  authTag: string
  refreshIv: string | null
  refreshAuthTag: string | null
  expiresAt: Date | null
  scope: string
  connectedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface OAuthPendingEntry {
  codeVerifier: string
  brandId: string
  platform: SocialPlatform
  userId: string
  createdAt: Date
}

export interface EnhancedSocialConnection {
  platform: SocialPlatform
  accountId: string
  accountName: string
  displayName?: string
  profileUrl?: string
  avatarUrl?: string
  enabled: boolean
  connectedBy: string
  connectedAt: Date
  tokenStatus: 'active' | 'expired' | 'revoked'
}
