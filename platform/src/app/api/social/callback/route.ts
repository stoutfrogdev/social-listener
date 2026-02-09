import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseOAuthState } from '@/lib/social/oauth-state'
import { getProvider } from '@/lib/social/registry'
import {
  storeSocialToken,
  addSocialConnection,
  getOAuthPending,
  deleteOAuthPending,
} from '@/models/social-connection'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Build redirect helper
  function redirectToError(brandId: string | null, message: string) {
    const path = brandId ? `/dashboard/brands/${brandId}` : '/dashboard/brands'
    const url = new URL(path, request.url)
    url.searchParams.set('error', message)
    return NextResponse.redirect(url)
  }

  if (error) {
    return redirectToError(null, `OAuth denied: ${error}`)
  }

  if (!code || !state) {
    return redirectToError(null, 'Missing OAuth code or state')
  }

  // Decrypt and validate state
  let statePayload
  try {
    statePayload = parseOAuthState(state)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid OAuth state'
    return redirectToError(null, message)
  }

  const { brandId, userId, platform } = statePayload

  // Verify session matches the user who initiated
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.id !== userId) {
    return redirectToError(brandId, 'Session mismatch — please try connecting again')
  }

  const callbackUrl = process.env.SOCIAL_OAUTH_CALLBACK_URL
  if (!callbackUrl) {
    return redirectToError(brandId, 'OAuth callback URL not configured')
  }

  try {
    const provider = getProvider(platform)
    const extras: Record<string, string> = {}

    // For Twitter PKCE, retrieve code_verifier
    if (platform === 'twitter') {
      const stateKey = Buffer.from(state.slice(0, 32)).toString('hex')
      const pending = await getOAuthPending(stateKey)
      if (!pending) {
        return redirectToError(brandId, 'OAuth session expired — please try connecting again')
      }
      extras.codeVerifier = pending.codeVerifier
      await deleteOAuthPending(stateKey)
    }

    // Exchange code for tokens
    const tokens = await provider.exchangeCodeForTokens(code, callbackUrl, extras)

    // Get account info
    const accountInfo = await provider.getAccountInfo(tokens)

    // Store encrypted tokens
    await storeSocialToken(brandId, platform, tokens, accountInfo, userId)

    // Update brand socialConnections[]
    await addSocialConnection(brandId, platform, accountInfo, userId)

    // Redirect to brand page with success
    const successUrl = new URL(`/dashboard/brands/${brandId}`, request.url)
    successUrl.searchParams.set('connected', platform)
    return NextResponse.redirect(successUrl)
  } catch (err) {
    console.error('OAuth callback error:', err)
    const message = err instanceof Error ? err.message : 'Failed to complete connection'
    return redirectToError(brandId, message)
  }
}
