import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBrand, getBrandsByUserId } from '@/models/brand'
import type { ApiResponse, Brand, CreateBrandInput } from '@/types'

// GET /api/brands - List user's brands
export async function GET(): Promise<NextResponse<ApiResponse<Brand[]>>> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const brands = await getBrandsByUserId(session.user.id)
    return NextResponse.json({ success: true, data: brands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST /api/brands - Create new brand
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Brand>>> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body: CreateBrandInput = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      )
    }

    const brand = await createBrand(session.user.id, {
      name: body.name.trim(),
      description: body.description?.trim(),
      settings: body.settings,
    })

    return NextResponse.json({ success: true, data: brand }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
