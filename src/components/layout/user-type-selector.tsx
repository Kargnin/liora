'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2 } from 'lucide-react'

interface UserTypeSelectorProps {
  onSelectType: (type: 'founder' | 'investor') => void
}

export function UserTypeSelector({ onSelectType }: UserTypeSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary mr-4" />
            <h1 className="text-5xl font-bold text-foreground">Liora</h1>
          </div>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI-powered platform connecting startup founders with investors
            through intelligent matching and comprehensive analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20 h-full">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-2xl w-fit group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <Building2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl mb-2">
                I&apos;m a Founder
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Upload your company details and get matched with relevant
                investors
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col h-full">
              <ul className="space-y-3 text-muted-foreground mb-8 flex-grow">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Upload pitch deck and company information
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  AI-powered interview and analysis
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Get matched with interested investors
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Schedule calls with potential partners
                </li>
              </ul>
              <Button
                onClick={() => onSelectType('founder')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Continue as Founder
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20 h-full">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-4 bg-green-50 dark:bg-green-950 rounded-2xl w-fit group-hover:bg-green-100 dark:group-hover:bg-green-900 transition-colors">
                <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl mb-2">
                I&apos;m an Investor
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Discover startups that match your investment criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col h-full">
              <ul className="space-y-3 text-muted-foreground mb-8 flex-grow">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Set your investment preferences
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Browse AI-generated investment memos
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Filter companies by your criteria
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Connect with promising founders
                </li>
              </ul>
              <Button
                onClick={() => onSelectType('investor')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Continue as Investor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
