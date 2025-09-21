'use client'

import { useState } from 'react'
import { VideoPreview } from '@/components/interview/VideoPreview'

export default function SetupDemoPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Setup Demo</h1>
      <VideoPreview onSetupComplete={() => {}} onDeviceChange={() => {}} />
    </div>
  )
}