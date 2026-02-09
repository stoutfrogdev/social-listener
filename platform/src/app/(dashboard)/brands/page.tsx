import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrandsByUserId } from '@/models/brand'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BrandsPage() {
  const session = await getServerSession(authOptions)
  const brands = session?.user?.id
    ? await getBrandsByUserId(session.user.id)
    : []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Brands</h1>
        <Button asChild>
          <Link href="/dashboard/brands/new">Create Brand</Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any brands yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/brands/new">Create Your First Brand</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/dashboard/brands/${brand.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {brand.description}
                    </p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{brand.members.length} member{brand.members.length !== 1 ? 's' : ''}</span>
                    <span>{brand.socialConnections.length} connection{brand.socialConnections.length !== 1 ? 's' : ''}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
