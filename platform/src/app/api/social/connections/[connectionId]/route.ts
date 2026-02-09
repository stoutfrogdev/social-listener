import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toggleConnectionSchema } from '@/lib/validations'
import { getBrandById, userCanEditBrand } from '@/models/brand'
import { getProvider } from '@/lib/social/registry'
import {
  getSocialToken,
  decryptAccessToken,
  decryptRefreshToken,
  deleteSocialToken,
  removeSocialConnection,
  toggleSocialConnection,
} from '@/models/social-connection'
import type { SocialPlatform } from '@/lib/social/types'

// connectionId format: {brandId}_{platform}_{accountId}
function parseConnectionId(connectionId: string) {
  const parts = connectionId.split('_')
  if (parts.length < 3) return null
  const platform = parts[1]
  if (!['twitter', 'linkedin', 'reddit'].includes(platform)) return null
  return {
    brandId: parts[0],
    platform: platform as SocialPlatform,
    accountId: parts.slice(2).join('_'),
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = parseConnectionId(params.connectionId)
  if (!parsed) {
    return NextResponse.json(
      { success: false, error: 'Invalid connection ID format' },
      { status: 400 }
    )
  }

  const { brandId, platform, accountId } = parsed

  // Check edit permission
  const brand = await getBrandById(brandId)
  const canEdit = await userCanEditBrand(session.user.id, brandId, brand)
  if (!canEdit || !brand) {
    return NextResponse.json(
      { success: false, error: 'Brand not found or permission denied' },
      { status: 403 }
    )
  }

  try {
    // Attempt to revoke tokens with the provider
    const stored = await getSocialToken(brandId, platform, accountId)
    if (stored) {
      try {
        const provider = getProvider(platform)
        const accessToken = decryptAccessToken(stored)
        const refreshToken = decryptRefreshToken(stored)
        await provider.revokeAccess({
          accessToken,
          refreshToken,
          expiresAt: stored.expiresAt,
          scope: stored.scope,
          tokenType: 'bearer',
        })
      } catch {
        // Best-effort revocation — continue with deletion
      }
    }

    // Delete token from Firestore
    await deleteSocialToken(brandId, platform, accountId)

    // Remove from brand socialConnections[]
    await removeSocialConnection(brandId, platform, accountId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = parseConnectionId(params.connectionId)
  if (!parsed) {
    return NextResponse.json(
      { success: false, error: 'Invalid connection ID format' },
      { status: 400 }
    )
  }

  const { brandId, platform, accountId } = parsed

  const brand = await getBrandById(brandId)
  const canEdit = await userCanEditBrand(session.user.id, brandId, brand)
  if (!canEdit || !brand) {
    return NextResponse.json(
      { success: false, error: 'Brand not found or permission denied' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const validation = toggleConnectionSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error.issues[0].message },
      { status: 400 }
    )
  }

  try {
    await toggleSocialConnection(brandId, platform, accountId, validation.data.enabled)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle connection error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle connection' },
      { status: 500 }
    )
  }
}
