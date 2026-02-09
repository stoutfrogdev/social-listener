import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { SignOutButton } from '@/components/ui/sign-out-button'
import { MobileNav } from '@/components/ui/mobile-nav'

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg">
            Social Listener
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/brands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Brands
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{session.user.name}</span>
          <SignOutButton />
        </div>
        <MobileNav userName={session.user.name} />
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
