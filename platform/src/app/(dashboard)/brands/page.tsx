import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrandsByUserId } from '@/models/brand'
import Link from 'next/link'

export default async function BrandsPage() {
  const session = await getServerSession(authOptions)
  const brands = session?.user?.id
    ? await getBrandsByUserId(session.user.id)
    : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Brands</h1>
        <Link href="/dashboard/brands/new" className="btn btn-primary">
          Create Brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            You haven&apos;t created any brands yet.
          </p>
          <Link href="/dashboard/brands/new" className="btn btn-primary">
            Create Your First Brand
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {brands.map((brand) => (
            <Link key={brand.id} href={`/dashboard/brands/${brand.id}`} className="card">
              <h3>{brand.name}</h3>
              {brand.description && (
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                  {brand.description}
                </p>
              )}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '0.875rem' }}>
                <span>{brand.members.length} member{brand.members.length !== 1 ? 's' : ''}</span>
                <span>{brand.socialConnections.length} connection{brand.socialConnections.length !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
