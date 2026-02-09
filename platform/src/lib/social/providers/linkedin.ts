import type { SocialProvider, OAuthTokens, SocialAccountInfo } from '../types'

export const linkedinProvider: SocialProvider = {
  platform: 'linkedin',
  displayName: 'LinkedIn',
  scopes: ['openid', 'profile', 'w_member_social'],

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID
    if (!clientId) throw new Error('LINKEDIN_CLIENT_ID not configured')

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: this.scopes.join(' '),
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  },

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('LinkedIn OAuth credentials not configured')

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn token exchange failed: ${error}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      scope: data.scope ?? '',
      tokenType: data.token_type ?? 'Bearer',
    }
  },

  async getAccountInfo(tokens: OAuthTokens): Promise<SocialAccountInfo> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`LinkedIn account info failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      accountId: data.sub,
      accountName: data.name || `${data.given_name} ${data.family_name}`,
      displayName: data.name || `${data.given_name} ${data.family_name}`,
      profileUrl: `https://www.linkedin.com/in/${data.sub}`,
      avatarUrl: data.picture,
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('LinkedIn OAuth credentials not configured')

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn token refresh failed: ${error}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      scope: data.scope ?? '',
      tokenType: data.token_type ?? 'Bearer',
    }
  },

  async revokeAccess(): Promise<void> {
    // LinkedIn doesn't have a standard token revocation endpoint
    // Tokens expire naturally (60 days for access tokens)
  },
}
