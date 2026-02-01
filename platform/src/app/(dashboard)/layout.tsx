import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { SignOutButton } from '@/components/ui/sign-out-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        borderBottom: '1px solid #eaeaea',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/dashboard" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            Social Listener
          </Link>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/brands">Brands</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>{session.user.name}</span>
          <SignOutButton />
        </div>
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  )
}
