'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Building2, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import type { UserType } from '@/types/user'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as UserType | null
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // If no user type specified, redirect to home
    if (!userType) {
      router.push('/')
      return
    }

    // If already authenticated, redirect to appropriate dashboard
    if (isAuthenticated) {
      router.push(`/${userType}`)
    }
  }, [userType, router, isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !userType) {
      return
    }

    setIsLoading(true)
    
    try {
      // Use Zustand store for authentication
      await login(name.trim(), userType)
      
      // Redirect to appropriate dashboard
      router.push(`/${userType}`)
    } catch (error) {
      console.error('Login failed:', error)
      // In a real app, show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  if (!userType) {
    return null // Will redirect in useEffect
  }

  const Icon = userType === 'founder' ? Building2 : Users
  const title = userType === 'founder' ? 'Founder Login' : 'Investor Login'
  const description = userType === 'founder' 
    ? 'Access your startup dashboard' 
    : 'Access your investment dashboard'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={handleBackToHome}>
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}