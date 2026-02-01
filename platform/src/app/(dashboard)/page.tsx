import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrandsByUserId } from '@/models/brand'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const brands = session?.user?.id
    ? await getBrandsByUserId(session.user.id)
    : []

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card">
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Brands</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{brands.length}</p>
        </div>
        <div className="card">
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Pending Approvals</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="card">
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Published Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Your Brands</h2>
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
              <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '1rem' }}>
                {brand.members.length} member{brand.members.length !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
