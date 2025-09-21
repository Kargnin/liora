'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn('mr-4 hidden md:flex', className)}>
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <div className="h-6 w-6 rounded bg-primary" />
        <span className="hidden font-bold sm:inline-block">Liora</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/about"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/about' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/contact' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Contact
        </Link>
      </nav>
    </div>
  )
}