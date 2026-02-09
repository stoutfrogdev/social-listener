import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectSocialSchema } from '@/lib/validations'
import { userCanEditBrand } from '@/models/brand'
import { getProvider, isConfigured } from '@/lib/social/registry'
import { createOAuthState } from '@/lib/social/oauth-state'
import { storeOAuthPending } from '@/models/social-connection'
import { createCodeVerifier, getTwitterAuthorizationUrl } from '@/lib/social/providers/twitter'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = connectSocialSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { brandId, platform } = parsed.data

    // Check brand edit permission
    const canEdit = await userCanEditBrand(session.user.id, brandId)
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage connections for this brand' },
        { status: 403 }
      )
    }

    // Check provider is configured
    if (!isConfigured(platform)) {
      return NextResponse.json(
        { success: false, error: `${platform} is not configured. Please add API credentials.` },
        { status: 400 }
      )
    }

    const callbackUrl = process.env.SOCIAL_OAUTH_CALLBACK_URL
    if (!callbackUrl) {
      return NextResponse.json(
        { success: false, error: 'OAuth callback URL not configured' },
        { status: 500 }
      )
    }

    // Create encrypted state
    const state = createOAuthState(brandId, session.user.id, platform)

    let authorizationUrl: string

    if (platform === 'twitter') {
      // Twitter requires PKCE — store code_verifier
      const { codeVerifier, codeChallenge } = createCodeVerifier()

      // Use the nonce from the state as the key for oauthPending
      // We extract it by decoding - but to keep it simple, use a hash of the state
      const stateKey = Buffer.from(state.slice(0, 32)).toString('hex')

      await storeOAuthPending(stateKey, {
        codeVerifier,
        brandId,
        platform,
        userId: session.user.id,
      })

      authorizationUrl = getTwitterAuthorizationUrl(state, callbackUrl, codeChallenge)
    } else {
      const provider = getProvider(platform)
      authorizationUrl = await Promise.resolve(provider.getAuthorizationUrl(state, callbackUrl))
    }

    return NextResponse.json({ success: true, data: { authorizationUrl } })
  } catch (error) {
    console.error('Social connect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate connection' },
      { status: 500 }
    )
  }
}
