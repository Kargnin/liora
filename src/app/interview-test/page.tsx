'use client'

/**
 * Simulated Chatbot Interview Test Page
 * Tests the enhanced LangGraph multi-agent system with a simple chat interface
 */

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SerializedMessage, WorkflowStatus, MemoryStats, InterviewApiResponse } from '@/types/api-interview'

interface ChatMessage {
  id: string
  type: 'ai' | 'human'
  content: string
  timestamp: Date
}

export default function InterviewTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`)
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    currentStep: 'not_started',
    progress: 0,
    questionsRemaining: 5,
  })
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({ 
    totalConversations: 0, 
    memoryHealth: 'good' 
  })
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize interview session
  useEffect(() => {
    const initInterview = async () => {
      try {
        setIsLoading(true)

        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'initialize',
            sessionId,
          }),
        })

        const data = await response.json()

        if (data.success) {
          console.log('🔍 Raw API data:', data)
          console.log('🔍 Messages array:', data.state.messages)
          
          // Convert API messages to chat messages using proper serialized format
          const chatMessages = data.state.messages.map(
            (msg: SerializedMessage, index: number) => ({
              id: `msg-${index}`,
              type: msg.type === 'ai' ? ('ai' as const) : ('human' as const),
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
              timestamp: new Date(),
            })
          )

          setMessages(chatMessages)
          setWorkflowStatus(data.workflowStatus)
          setMemoryStats(data.memoryStats)
          setIsInterviewComplete(data.state.isComplete)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('Failed to initialize interview:', error)
        setMessages([
          {
            id: 'error-1',
            type: 'ai',
            content:
              'Sorry, there was an error initializing the interview system. Please refresh the page.',
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initInterview()
  }, [sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'human',
        content: inputValue,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage])
      const currentInput = inputValue
      setInputValue('')

      // Process response through API
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'processResponse',
          sessionId,
          data: { response: currentInput },
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Convert new messages to chat format using proper serialized format
        const newChatMessages = data.state.messages
          .slice(messages.length) // Only get new messages
          .map((msg: SerializedMessage, index: number) => ({
            id: `msg-${messages.length + index}`,
            type: msg.type === 'ai' ? ('ai' as const) : ('human' as const),
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            timestamp: new Date(),
          }))

        setMessages(prev => [...prev, ...newChatMessages])
        setWorkflowStatus(data.workflowStatus)
        setMemoryStats(data.memoryStats)
        setIsInterviewComplete(data.state.isComplete)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: 'ai',
          content:
            'Sorry, there was an error processing your response. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetInterview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const chatMessages = data.state.messages.map(
          (msg: SerializedMessage, index: number) => ({
            id: `msg-${index}`,
            type: msg.type === 'ai' ? ('ai' as const) : ('human' as const),
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            timestamp: new Date(),
          })
        )

        setMessages(chatMessages)
        setWorkflowStatus(data.workflowStatus)
        setMemoryStats(data.memoryStats)
        setIsInterviewComplete(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error resetting interview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🤖 AI Interview Simulation</span>
                <Badge variant={isInterviewComplete ? 'default' : 'secondary'}>
                  {isInterviewComplete ? 'Complete' : 'Active'}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg">
                <div className="space-y-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="flex justify-center items-center h-32 text-gray-500">
                      <div className="text-center">
                        <div className="text-lg mb-2">🤖</div>
                        <div>Initializing AI Interview System...</div>
                      </div>
                    </div>
                  )}
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'human'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isInterviewComplete
                      ? 'Interview completed!'
                      : 'Type your response...'
                  }
                  disabled={isLoading || isInterviewComplete}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    isLoading || !inputValue.trim() || isInterviewComplete
                  }
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Questions</span>
                  <span>{5 - workflowStatus.questionsRemaining}/5</span>
                </div>
                <Progress value={workflowStatus.progress} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Status</div>
                  <Badge variant="outline">{workflowStatus.currentStep}</Badge>
                </div>
                <div>
                  <div className="font-medium">Remaining</div>
                  <span>{workflowStatus.questionsRemaining} questions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Memory System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Conversations Stored</span>
                <Badge variant="secondary">
                  {memoryStats.totalConversations}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Memory Health</span>
                <Badge
                  variant={
                    memoryStats.memoryHealth === 'good'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {memoryStats.memoryHealth}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">LangGraph Agents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>🤖 Interviewer</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>📊 Analyst</span>
                  <Badge variant="secondary">Standby</Badge>
                </div>
                <div className="flex justify-between">
                  <span>🧠 Memory</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>🔍 RAG</span>
                  <Badge variant="secondary">Standby</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={resetInterview}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                🔄 Reset Interview
              </Button>
            </CardContent>
          </Card>

          {/* Demo Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo Features</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>✅ LangGraph Multi-Agent System</div>
              <div>✅ Vector Memory Integration</div>
              <div>✅ Contextual Question Generation</div>
              <div>✅ Real-time Progress Tracking</div>
              <div>✅ Simplified Workflow</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
