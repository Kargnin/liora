'use client'

import { InterviewRoom } from '@/components/interview'
import { InterviewData } from '@/types/interview'

export default function InterviewDemoPage() {
  const handleComplete = (data: InterviewData) => {
    console.log('Interview completed:', data)
    // In a real app, this would send data to backend
  }

  return (
    <div className="min-h-screen">
      <InterviewRoom
        founderId="demo-founder-123"
        onComplete={handleComplete}
      />
    </div>
  )
}