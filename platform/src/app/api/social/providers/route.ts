import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllProviders, isConfigured } from '@/lib/social/registry'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const providers = getAllProviders().map((p) => ({
    platform: p.platform,
    displayName: p.displayName,
    configured: isConfigured(p.platform),
  }))

  return NextResponse.json({ success: true, data: providers })
}
