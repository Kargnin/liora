"use client"

import { useState } from 'react'
import { VideoPreview } from '@/components/interview/VideoPreview'
import { DeviceSetup } from '@/components/interview/DeviceSetup'

export default function DeviceSetupPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Device Setup</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VideoPreview onSetupComplete={() => {}} onDeviceChange={() => {}} />
        <DeviceSetup 
          onDeviceSelected={() => {}} 
          onTestComplete={() => {}} 
          onQualityUpdate={() => {}} 
        />
      </div>
    </div>
  )
}