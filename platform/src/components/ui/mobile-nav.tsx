'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface MobileNavProps {
  userName: string
}

export function MobileNav({ userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-background border-b p-4 z-50">
          <nav className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/brands"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Brands
            </Link>
            <hr className="my-2" />
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}
