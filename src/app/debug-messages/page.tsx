'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugMessagesPage() {
  const [messages, setMessages] = useState<unknown[]>([])
  const [sessionId] = useState(() => `debug-${Date.now()}`)

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          sessionId
        })
      })

      const data = await response.json()
      console.log('Raw API response:', data)
      
      if (data.success) {
        setMessages(data.state.messages)
        console.log('Messages:', data.state.messages)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Messages Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchMessages}>Fetch Messages</Button>
          
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="p-4 border rounded">
                <h3 className="font-bold mb-2">Message {index + 1}</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}