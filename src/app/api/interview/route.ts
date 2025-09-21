/**
 * API Route for LangGraph Interview System
 * Handles server-side LangGraph execution to avoid browser compatibility issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { EnhancedSimpleCoordinator } from '@/lib/agents/enhanced-simple-coordinator'
import { BaseMessage } from '@langchain/core/messages'

// Store coordinators in memory (in production, use Redis or database)
const coordinators = new Map<string, EnhancedSimpleCoordinator>()
const states = new Map<string, unknown>()

// Helper function to serialize BaseMessage objects for JSON response
function serializeMessages(messages: BaseMessage[]) {
  return messages.map(msg => ({
    id: msg.id,
    type: msg._getType(), // 'ai', 'human', 'system', etc.
    content: msg.content,
    additional_kwargs: msg.additional_kwargs,
    response_metadata: msg.response_metadata
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId, data } = body

    switch (action) {
      case 'initialize': {
        const coordinator = new EnhancedSimpleCoordinator()
        coordinators.set(sessionId, coordinator)
        
        const initialState = await coordinator.executeWorkflow()
        states.set(sessionId, initialState)
        
        const memoryStats = await coordinator.getMemoryStats()
        const workflowStatus = coordinator.getWorkflowStatus(initialState)
        
        return NextResponse.json({
          success: true,
          state: {
            ...initialState,
            messages: serializeMessages(initialState.messages)
          },
          memoryStats,
          workflowStatus
        })
      }

      case 'processResponse': {
        const coordinator = coordinators.get(sessionId)
        const currentState = states.get(sessionId)
        
        if (!coordinator || !currentState) {
          return NextResponse.json({
            success: false,
            error: 'Session not found'
          }, { status: 404 })
        }

        const newState = await coordinator.processFounderResponse(data.response, currentState)
        states.set(sessionId, newState)
        
        const memoryStats = await coordinator.getMemoryStats()
        const workflowStatus = coordinator.getWorkflowStatus(newState)
        
        return NextResponse.json({
          success: true,
          state: {
            ...newState,
            messages: serializeMessages(newState.messages)
          },
          memoryStats,
          workflowStatus
        })
      }

      case 'reset': {
        const coordinator = coordinators.get(sessionId)
        
        if (!coordinator) {
          return NextResponse.json({
            success: false,
            error: 'Session not found'
          }, { status: 404 })
        }

        await coordinator.clearMemory()
        const initialState = await coordinator.executeWorkflow()
        states.set(sessionId, initialState)
        
        const memoryStats = await coordinator.getMemoryStats()
        const workflowStatus = coordinator.getWorkflowStatus(initialState)
        
        return NextResponse.json({
          success: true,
          state: {
            ...initialState,
            messages: serializeMessages(initialState.messages)
          },
          memoryStats,
          workflowStatus
        })
      }

      case 'getStats': {
        const coordinator = coordinators.get(sessionId)
        const currentState = states.get(sessionId)
        
        if (!coordinator || !currentState) {
          return NextResponse.json({
            success: false,
            error: 'Session not found'
          }, { status: 404 })
        }

        const memoryStats = await coordinator.getMemoryStats()
        const workflowStatus = coordinator.getWorkflowStatus(currentState)
        
        return NextResponse.json({
          success: true,
          memoryStats,
          workflowStatus,
          state: currentState
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Interview API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'Session ID required'
    }, { status: 400 })
  }

  const coordinator = coordinators.get(sessionId)
  const currentState = states.get(sessionId)
  
  if (!coordinator || !currentState) {
    return NextResponse.json({
      success: false,
      error: 'Session not found'
    }, { status: 404 })
  }

  const memoryStats = await coordinator.getMemoryStats()
  const workflowStatus = coordinator.getWorkflowStatus(currentState)
  
  return NextResponse.json({
    success: true,
    state: {
      ...currentState,
      messages: serializeMessages((currentState as any).messages)
    },
    memoryStats,
    workflowStatus
  })
}