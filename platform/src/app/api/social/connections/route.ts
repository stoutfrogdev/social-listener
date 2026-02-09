import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrandById, userCanAccessBrand } from '@/models/brand'
import { getConnectionsForBrand } from '@/models/social-connection'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const brandId = request.nextUrl.searchParams.get('brandId')
  if (!brandId) {
    return NextResponse.json(
      { success: false, error: 'brandId query parameter is required' },
      { status: 400 }
    )
  }

  const brand = await getBrandById(brandId)
  const canAccess = await userCanAccessBrand(session.user.id, brandId, brand)
  if (!canAccess || !brand) {
    return NextResponse.json(
      { success: false, error: 'Brand not found or access denied' },
      { status: 404 }
    )
  }

  const connections = getConnectionsForBrand(brand)
  return NextResponse.json({ success: true, data: connections })
}
