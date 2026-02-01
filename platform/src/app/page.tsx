import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Social Listener
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: '#666',
        marginBottom: '2rem',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        Monitor social media, generate AI-powered responses, and manage your brand presence with human-in-the-loop approval.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
        <Link href="/register" className="btn btn-secondary">
          Create Account
        </Link>
      </div>
    </main>
  )
}
