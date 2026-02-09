import type { SocialProvider, OAuthTokens, SocialAccountInfo } from '../types'

export const redditProvider: SocialProvider = {
  platform: 'reddit',
  displayName: 'Reddit',
  scopes: ['identity', 'read', 'submit'],

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.REDDIT_CLIENT_ID
    if (!clientId) throw new Error('REDDIT_CLIENT_ID not configured')

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      state,
      redirect_uri: redirectUri,
      duration: 'permanent',
      scope: this.scopes.join(' '),
    })

    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`
  },

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
    const clientId = process.env.REDDIT_CLIENT_ID
    const clientSecret = process.env.REDDIT_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Reddit OAuth credentials not configured')

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })

    // Reddit requires HTTP Basic auth for token exchange
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
        'User-Agent': 'SocialListener/1.0',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Reddit token exchange failed: ${error}`)
    }

    const data = await response.json()
    if (data.error) {
      throw new Error(`Reddit token exchange error: ${data.error}`)
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      scope: data.scope ?? '',
      tokenType: data.token_type ?? 'bearer',
    }
  },

  async getAccountInfo(tokens: OAuthTokens): Promise<SocialAccountInfo> {
    const response = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'User-Agent': 'SocialListener/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Reddit account info failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      accountId: data.id,
      accountName: `u/${data.name}`,
      displayName: data.subreddit?.title || data.name,
      profileUrl: `https://www.reddit.com/user/${data.name}`,
      avatarUrl: data.icon_img?.split('?')[0] || undefined,
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const clientId = process.env.REDDIT_CLIENT_ID
    const clientSecret = process.env.REDDIT_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Reddit OAuth credentials not configured')

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
        'User-Agent': 'SocialListener/1.0',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Reddit token refresh failed: ${error}`)
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
    const clientId = process.env.REDDIT_CLIENT_ID
    const clientSecret = process.env.REDDIT_CLIENT_SECRET
    if (!clientId || !clientSecret) return

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const params = new URLSearchParams({
      token: tokens.accessToken,
      token_type_hint: 'access_token',
    })

    await fetch('https://www.reddit.com/api/v1/revoke_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
        'User-Agent': 'SocialListener/1.0',
      },
      body: params.toString(),
    }).catch(() => {
      // Best-effort revocation
    })
  },
}
