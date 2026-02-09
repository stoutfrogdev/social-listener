import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getBrandById,
  updateBrand,
  deleteBrand,
  userCanAccessBrand,
  userCanEditBrand,
} from '@/models/brand'
import { updateBrandSchema } from '@/lib/validations'
import type { ApiResponse, Brand } from '@/types'

interface RouteParams {
  params: { id: string }
}

// GET /api/brands/[id] - Get brand details
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Brand>>> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { id } = params

  try {
    // Fetch once, pass to access check to avoid double read
    const brand = await getBrandById(id)
    const canAccess = await userCanAccessBrand(session.user.id, id, brand)
    if (!canAccess || !brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: brand })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

// PUT /api/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Brand>>> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { id } = params

  try {
    // Fetch once, pass to edit check to avoid double read
    const existingBrand = await getBrandById(id)
    const canEdit = await userCanEditBrand(session.user.id, id, existingBrand)
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = updateBrandSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const brand = await updateBrand(id, {
      name: result.data.name?.trim(),
      description: result.data.description?.trim(),
      settings: result.data.settings,
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: brand })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

// DELETE /api/brands/[id] - Delete brand
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { id } = params

  try {
    const brand = await getBrandById(id)
    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    if (brand.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the owner can delete a brand' },
        { status: 403 }
      )
    }

    const deleted = await deleteBrand(id)

    return NextResponse.json({ success: true, data: { deleted } })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
