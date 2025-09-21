'use client'

import { UserTypeSelector } from '@/components/layout/user-type-selector'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, userType } = useAuthStore()

  // If user is already authenticated, redirect to their dashboard
  useEffect(() => {
    if (isAuthenticated && userType) {
      router.push(`/${userType}`)
    }
  }, [isAuthenticated, userType, router])

  const handleSelectType = (type: 'founder' | 'investor') => {
    // Redirect to appropriate auth page
    router.push(`/auth/login?type=${type}`)
  }

  // Don't show user type selector if already authenticated
  if (isAuthenticated) {
    return null
  }

  return <UserTypeSelector onSelectType={handleSelectType} />
}
