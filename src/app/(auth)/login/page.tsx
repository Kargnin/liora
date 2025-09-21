'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Users, ArrowLeft } from 'lucide-react'

function LoginForm() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as 'founder' | 'investor'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Store user data (will be replaced with proper auth)
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      type: userType,
    }

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')

    // Redirect to appropriate dashboard
    router.push(userType === 'founder' ? '/founder' : '/investor')
  }

  const handleBack = () => {
    router.push('/')
  }

  if (!userType) {
    router.push('/')
    return null
  }

  const isFounder = userType === 'founder'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to selection
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 p-3 rounded-full w-fit ${
                isFounder ? 'bg-blue-100' : 'bg-green-100'
              }`}
            >
              {isFounder ? (
                <Building2 className="h-8 w-8 text-blue-600" />
              ) : (
                <Users className="h-8 w-8 text-green-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              Welcome, {isFounder ? 'Founder' : 'Investor'}!
            </CardTitle>
            <CardDescription>
              Enter your name to get started with Liora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="text-center text-lg py-6"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? 'Signing in...' : `Continue as ${userType}`}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              For demo purposes, only your name is required
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
