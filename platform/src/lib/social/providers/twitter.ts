import { randomBytes, createHash } from 'crypto'
import type { SocialProvider, OAuthTokens, SocialAccountInfo } from '../types'

function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

export function createCodeVerifier(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  return { codeVerifier, codeChallenge }
}

export const twitterProvider: SocialProvider = {
  platform: 'twitter',
  displayName: 'Twitter / X',
  scopes: ['tweet.read', 'users.read', 'offline.access'],

  getAuthorizationUrl(_state: string, _redirectUri: string): string {
    // Twitter uses PKCE — use getTwitterAuthorizationUrl() which accepts codeChallenge
    throw new Error('Use getTwitterAuthorizationUrl() instead — PKCE requires code_challenge parameter')
  },

  async exchangeCodeForTokens(code: string, redirectUri: string, extras?: Record<string, string>): Promise<OAuthTokens> {
    const clientId = process.env.TWITTER_CLIENT_ID
    if (!clientId) throw new Error('TWITTER_CLIENT_ID not configured')

    const codeVerifier = extras?.codeVerifier
    if (!codeVerifier) throw new Error('code_verifier is required for Twitter PKCE flow')

    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter token exchange failed: ${error}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      scope: data.scope ?? '',
      tokenType: data.token_type ?? 'bearer',
    }
  },

  async getAccountInfo(tokens: OAuthTokens): Promise<SocialAccountInfo> {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`Twitter account info failed: ${response.status}`)
    }

    const { data } = await response.json()
    return {
      accountId: data.id,
      accountName: `@${data.username}`,
      displayName: data.name,
      profileUrl: `https://x.com/${data.username}`,
      avatarUrl: data.profile_image_url,
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const clientId = process.env.TWITTER_CLIENT_ID
    if (!clientId) throw new Error('TWITTER_CLIENT_ID not configured')

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    })

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter token refresh failed: ${error}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      scope: data.scope ?? '',
      tokenType: data.token_type ?? 'bearer',
    }
  },

  async revokeAccess(tokens: OAuthTokens): Promise<void> {
    const clientId = process.env.TWITTER_CLIENT_ID
    if (!clientId) return

    const params = new URLSearchParams({
      token: tokens.accessToken,
      client_id: clientId,
      token_type_hint: 'access_token',
    })

    await fetch('https://api.twitter.com/2/oauth2/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }).catch(() => {
      // Best-effort revocation
    })
  },
}

export function getTwitterAuthorizationUrl(
  state: string,
  redirectUri: string,
  codeChallenge: string
): string {
  const clientId = process.env.TWITTER_CLIENT_ID
  if (!clientId) throw new Error('TWITTER_CLIENT_ID not configured')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: twitterProvider.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
}
