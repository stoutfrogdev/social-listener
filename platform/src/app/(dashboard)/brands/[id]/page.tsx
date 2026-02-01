import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrandById, userCanAccessBrand } from '@/models/brand'
import { BrandDetail } from '@/components/brands/brand-detail'

interface PageProps {
  params: { id: string }
}

export default async function BrandDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    notFound()
  }

  const canAccess = await userCanAccessBrand(session.user.id, params.id)
  if (!canAccess) {
    notFound()
  }

  const brand = await getBrandById(params.id)
  if (!brand) {
    notFound()
  }

  const isOwner = brand.ownerId === session.user.id
  const member = brand.members.find(m => m.userId === session.user.id)
  const canEdit = isOwner || member?.role === 'admin'

  return <BrandDetail brand={brand} canEdit={canEdit} isOwner={isOwner} />
}
