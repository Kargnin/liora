/**
 * Media Processor for WebRTC Audio/Video Streaming
 * Handles audio capture, processing, and streaming to Gemini Live API
 */

import type {
  MediaStreamConfig,
  MediaDevice,
  AudioQualityMetrics,
  MediaData,
  GeminiError
} from '@/types/interview'

export interface MediaProcessorConfig {
  audioConstraints: MediaTrackConstraints
  videoConstraints: MediaTrackConstraints
  processingInterval: number // milliseconds
  qualityCheckInterval: number // milliseconds
}

export interface AudioProcessingOptions {
  enableNoiseReduction: boolean
  enableEchoCancellation: boolean
  enableAutoGainControl: boolean
  volumeThreshold: number
}

/**
 * Handles WebRTC media capture and processing for Gemini Live API
 */
export class MediaProcessor {
  private mediaStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private processor: ScriptProcessorNode | null = null
  private isProcessing = false
  private qualityMetrics: AudioQualityMetrics | null = null
  private qualityCheckTimer: NodeJS.Timeout | null = null
  private onMediaDataCallback: ((data: MediaData) => void) | null = null
  private onQualityUpdateCallback: ((metrics: AudioQualityMetrics) => void) | null = null
  private onErrorCallback: ((error: GeminiError) => void) | null = null

  constructor(private config: MediaProcessorConfig) {}

  /**
   * Initialize media capture with specified constraints
   */
  async initializeMedia(streamConfig: MediaStreamConfig): Promise<MediaStream> {
    try {
      // Request user media with specified constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: streamConfig.audio.sampleRate,
          channelCount: streamConfig.audio.channels,
          echoCancellation: streamConfig.audio.echoCancellation,
          noiseSuppression: streamConfig.audio.noiseSuppression,
          autoGainControl: streamConfig.audio.autoGainControl,
          ...this.config.audioConstraints
        },
        video: streamConfig.video ? {
          width: streamConfig.video.width,
          height: streamConfig.video.height,
          frameRate: streamConfig.video.frameRate,
          facingMode: streamConfig.video.facingMode,
          ...this.config.videoConstraints
        } : false
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Initialize audio processing
      await this.initializeAudioProcessing()
      
      // Start quality monitoring
      this.startQualityMonitoring()
      
      console.log('Media initialized successfully')
      return this.mediaStream
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'MEDIA_INIT_FAILED',
        message: `Failed to initialize media: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, streamConfig }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Start processing audio for streaming
   */
  async startAudioProcessing(options: AudioProcessingOptions = {
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    volumeThreshold: 0.01
  }): Promise<void> {
    if (!this.mediaStream || !this.audioContext) {
      throw new Error('Media not initialized')
    }

    try {
      const audioTrack = this.mediaStream.getAudioTracks()[0]
      if (!audioTrack) {
        throw new Error('No audio track available')
      }

      // Apply audio processing options
      await audioTrack.applyConstraints({
        echoCancellation: options.enableEchoCancellation,
        noiseSuppression: options.enableNoiseReduction,
        autoGainControl: options.enableAutoGainControl
      })

      // Create audio processing pipeline
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.analyser = this.audioContext.createAnalyser()
      
      // Configure analyser
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8
      
      // Create script processor for real-time audio processing
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
      
      // Connect audio nodes
      this.microphone.connect(this.analyser)
      this.analyser.connect(this.processor)
      this.processor.connect(this.audioContext.destination)
      
      // Set up audio processing callback
      this.processor.onaudioprocess = (event) => {
        this.processAudioBuffer(event.inputBuffer, options.volumeThreshold)
      }
      
      this.isProcessing = true
      console.log('Audio processing started')
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'AUDIO_PROCESSING_FAILED',
        message: `Failed to start audio processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, options }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Stop audio processing
   */
  stopAudioProcessing(): void {
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }
    
    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }
    
    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }
    
    this.isProcessing = false
    console.log('Audio processing stopped')
  }

  /**
   * Get available media devices
   */
  async getAvailableDevices(): Promise<MediaDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      return devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audioinput' | 'audiooutput' | 'videoinput',
        groupId: device.groupId
      }))
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'DEVICE_ENUMERATION_FAILED',
        message: `Failed to enumerate devices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Switch to a different audio/video device
   */
  async switchDevice(deviceId: string, type: 'audio' | 'video'): Promise<void> {
    if (!this.mediaStream) {
      throw new Error('Media stream not initialized')
    }

    try {
      const constraints: MediaStreamConstraints = {}
      
      if (type === 'audio') {
        constraints.audio = { deviceId: { exact: deviceId } }
        // Stop current audio tracks
        this.mediaStream.getAudioTracks().forEach(track => track.stop())
      } else {
        constraints.video = { deviceId: { exact: deviceId } }
        // Stop current video tracks
        this.mediaStream.getVideoTracks().forEach(track => track.stop())
      }
      
      // Get new media stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Replace tracks in existing stream
      if (type === 'audio') {
        const newAudioTrack = newStream.getAudioTracks()[0]
        if (newAudioTrack) {
          this.mediaStream.addTrack(newAudioTrack)
          // Reinitialize audio processing with new track
          if (this.isProcessing) {
            this.stopAudioProcessing()
            await this.initializeAudioProcessing()
            await this.startAudioProcessing()
          }
        }
      } else {
        const newVideoTrack = newStream.getVideoTracks()[0]
        if (newVideoTrack) {
          this.mediaStream.addTrack(newVideoTrack)
        }
      }
      
      console.log(`Switched to ${type} device: ${deviceId}`)
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'DEVICE_SWITCH_FAILED',
        message: `Failed to switch ${type} device: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, deviceId, type }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Get current audio quality metrics
   */
  getCurrentQualityMetrics(): AudioQualityMetrics | null {
    return this.qualityMetrics ? { ...this.qualityMetrics } : null
  }

  /**
   * Set callback for media data
   */
  onMediaData(callback: (data: MediaData) => void): void {
    this.onMediaDataCallback = callback
  }

  /**
   * Set callback for quality updates
   */
  onQualityUpdate(callback: (metrics: AudioQualityMetrics) => void): void {
    this.onQualityUpdateCallback = callback
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: GeminiError) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Stop quality monitoring
    if (this.qualityCheckTimer) {
      clearInterval(this.qualityCheckTimer)
      this.qualityCheckTimer = null
    }
    
    // Stop audio processing
    this.stopAudioProcessing()
    
    // Stop media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    console.log('Media processor cleaned up')
  }

  // Private methods

  private async initializeAudioProcessing(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // Optimized for speech
      })
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    }
  }

  private processAudioBuffer(buffer: AudioBuffer, volumeThreshold: number): void {
    if (!this.onMediaDataCallback) return
    
    const inputData = buffer.getChannelData(0)
    const bufferLength = inputData.length
    
    // Calculate RMS (Root Mean Square) for volume detection
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += inputData[i] * inputData[i]
    }
    const rms = Math.sqrt(sum / bufferLength)
    
    // Only send audio data if volume is above threshold (voice activity detection)
    if (rms > volumeThreshold) {
      // Convert Float32Array to ArrayBuffer
      const int16Array = new Int16Array(bufferLength)
      for (let i = 0; i < bufferLength; i++) {
        // Convert float to 16-bit PCM
        const sample = Math.max(-1, Math.min(1, inputData[i]))
        int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      }
      
      const mediaData: MediaData = {
        type: 'audio',
        data: int16Array.buffer,
        timestamp: Date.now(),
        metadata: {
          sampleRate: this.audioContext?.sampleRate || 16000,
          channels: 1,
          encoding: 'pcm16',
          rms: rms
        }
      }
      
      this.onMediaDataCallback(mediaData)
    }
  }

  private startQualityMonitoring(): void {
    this.qualityCheckTimer = setInterval(() => {
      this.updateQualityMetrics()
    }, this.config.qualityCheckInterval)
  }

  private updateQualityMetrics(): void {
    if (!this.analyser || !this.mediaStream) return
    
    try {
      // Get frequency data for analysis
      const bufferLength = this.analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      this.analyser.getByteFrequencyData(dataArray)
      
      // Calculate audio levels
      const sum = dataArray.reduce((acc, value) => acc + value, 0)
      const average = sum / bufferLength
      const inputLevel = Math.round((average / 255) * 100)
      
      // Get time domain data for noise analysis
      const timeDomainData = new Uint8Array(bufferLength)
      this.analyser.getByteTimeDomainData(timeDomainData)
      
      // Simple noise level calculation
      let noiseSum = 0
      for (let i = 0; i < timeDomainData.length; i++) {
        const normalized = (timeDomainData[i] - 128) / 128
        noiseSum += Math.abs(normalized)
      }
      const noiseLevel = Math.round((noiseSum / timeDomainData.length) * 100)
      
      // Get video quality if available
      const videoTrack = this.mediaStream.getVideoTracks()[0]
      const videoSettings = videoTrack?.getSettings()
      
      this.qualityMetrics = {
        audio: {
          inputLevel,
          outputLevel: 0, // Would need output analysis
          noiseLevel,
          echoDetected: false, // Would need echo detection algorithm
          qualityScore: Math.max(0, 100 - noiseLevel)
        },
        video: {
          resolution: videoSettings ? `${videoSettings.width}x${videoSettings.height}` : '0x0',
          frameRate: videoSettings?.frameRate || 0,
          brightness: 50, // Would need brightness analysis
          qualityScore: videoSettings ? 85 : 0
        },
        recommendations: this.generateRecommendations(inputLevel, noiseLevel)
      }
      
      // Notify callback
      if (this.onQualityUpdateCallback) {
        this.onQualityUpdateCallback(this.qualityMetrics)
      }
      
    } catch (error) {
      console.error('Error updating quality metrics:', error)
    }
  }

  private generateRecommendations(inputLevel: number, noiseLevel: number): string[] {
    const recommendations: string[] = []
    
    if (inputLevel < 20) {
      recommendations.push('Microphone level is low. Please speak louder or move closer to the microphone.')
    }
    
    if (inputLevel > 90) {
      recommendations.push('Microphone level is too high. Please lower your voice or move away from the microphone.')
    }
    
    if (noiseLevel > 30) {
      recommendations.push('High background noise detected. Consider using a quieter environment or noise-canceling headphones.')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Audio quality is good.')
    }
    
    return recommendations
  }

  private handleError(error: GeminiError): void {
    console.error('Media Processor Error:', error)
    
    if (this.onErrorCallback) {
      this.onErrorCallback(error)
    }
  }
}

/**
 * Default media processor configuration
 */
export const DEFAULT_MEDIA_CONFIG: MediaProcessorConfig = {
  audioConstraints: {
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  },
  videoConstraints: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 30 }
  },
  processingInterval: 100, // 100ms chunks
  qualityCheckInterval: 1000 // Check quality every second
}

/**
 * Factory function to create MediaProcessor instance
 */
export function createMediaProcessor(config: Partial<MediaProcessorConfig> = {}): MediaProcessor {
  return new MediaProcessor({ ...DEFAULT_MEDIA_CONFIG, ...config })
}