import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBrand, getBrandsByUserId } from '@/models/brand'
import { createBrandSchema } from '@/lib/validations'
import type { ApiResponse, Brand } from '@/types'

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
    const body = await request.json()
    const result = createBrandSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const brand = await createBrand(
      session.user.id,
      session.user.name,
      session.user.email,
      {
        name: result.data.name.trim(),
        description: result.data.description?.trim(),
        settings: result.data.settings,
      }
    )

    return NextResponse.json({ success: true, data: brand }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
