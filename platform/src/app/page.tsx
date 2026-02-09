import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4">
        Social Listener
      </h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-xl">
        Monitor social media, generate AI-powered responses, and manage your brand presence with human-in-the-loop approval.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
    </main>
  )
}
