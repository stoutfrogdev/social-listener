import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrandsByUserId } from '@/models/brand'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const brands = session?.user?.id
    ? await getBrandsByUserId(session.user.id)
    : []

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{brands.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Brands</h2>
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
                  <p className="text-xs text-muted-foreground">
                    {brand.members.length} member{brand.members.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
