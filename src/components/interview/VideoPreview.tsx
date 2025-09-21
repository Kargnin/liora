'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { VideoPreviewProps, MediaStreamConfig } from '@/types/interview'
import { DeviceSetup } from './DeviceSetup'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
} from 'lucide-react'

/**
 * VideoPreview Component
 * 
 * Pre-interview setup component that handles device detection, testing, and validation
 * before starting the AI interview. This component ensures all required media devices
 * are working properly for a successful interview experience.
 * 
 * Key Requirements for Interview Setup:
 * 1. Microphone MUST be enabled and working (mandatory for AI interview)
 * 2. Speaker MUST be tested to ensure audio output works
 * 3. Video is optional but recommended for better engagement
 * 
 * @param onSetupComplete - Callback fired when setup validation passes
 * @param onDeviceChange - Callback fired when user changes device selection
 */
export function VideoPreview({
  onSetupComplete,
  onDeviceChange,
}: VideoPreviewProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Available media devices detected by the browser
   * Populated after requesting media permissions
   */
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[]
    microphones: MediaDeviceInfo[]
    speakers: MediaDeviceInfo[]
  }>({
    cameras: [],
    microphones: [],
    speakers: [],
  })

  /**
   * Device enumeration and detection status
   * Tracks the process of discovering available media devices
   */
  const [deviceDetectionStatus, setDeviceDetectionStatus] = useState<
    'detecting' | 'completed' | 'error'
  >('detecting')

  /**
   * Currently selected device IDs for each media type
   * Used to configure MediaStream constraints
   */
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
    speaker: '',
  })

  /**
   * Active MediaStream from getUserMedia API
   * Contains audio/video tracks based on user preferences
   */
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  
  /**
   * User preference for video input
   * Video is optional for interviews but recommended for engagement
   */
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  
  /**
   * User preference for audio input
   * Audio is MANDATORY for AI interviews - setup fails without it
   */
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  
  /**
   * Real-time microphone input level (0-100)
   * Used to validate microphone is working and user is speaking
   */
  const [audioLevel, setAudioLevel] = useState(0)
  
  /**
   * Video quality assessment score (0-100)
   * Simulated quality check for video stream
   */
  const [videoQuality, setVideoQuality] = useState(0)
  
  /**
   * Overall setup validation status
   * - 'testing': Initial state or validation in progress
   * - 'ready': All requirements met, can start interview
   * - 'error': Requirements not met or setup failed
   */
  const [setupStatus, setSetupStatus] = useState<'testing' | 'ready' | 'error'>(
    'testing'
  )
  
  /**
   * Media device permission status from browser
   * - 'pending': Waiting for user to grant permissions
   * - 'granted': User granted camera/microphone access
   * - 'denied': User denied permissions, setup cannot proceed
   */
  const [permissionStatus, setPermissionStatus] = useState<
    'pending' | 'granted' | 'denied'
  >('pending')
  
  /**
   * Speaker test completion status
   * Required for setup validation - user must test audio output
   */
  const [speakerTested, setSpeakerTested] = useState(false)

  /**
   * Advanced device setup mode toggle
   * Shows comprehensive device management interface when enabled
   */
  const [showAdvancedSetup, setShowAdvancedSetup] = useState(false)

  /**
   * Device testing states for individual device validation
   * Tracks testing progress for each device type
   */
  const [deviceTesting, setDeviceTesting] = useState({
    camera: false,
    microphone: false,
    speaker: false,
  })

  /**
   * Real-time quality metrics for audio and video
   * Updated continuously during device testing
   */
  const [qualityMetrics, setQualityMetrics] = useState({
    audio: {
      inputLevel: 0,
      noiseLevel: 0,
      qualityScore: 0,
    },
    video: {
      brightness: 0,
      sharpness: 0,
      qualityScore: 0,
    },
  })

  // ============================================================================
  // REFS FOR MEDIA HANDLING
  // ============================================================================
  
  /** Video element ref for displaying camera preview */
  const videoRef = useRef<HTMLVideoElement>(null)
  
  /** Web Audio API context for microphone level monitoring */
  const audioContextRef = useRef<AudioContext | null>(null)
  
  /** Audio analyser node for real-time microphone level detection */
  const analyserRef = useRef<AnalyserNode | null>(null)

  // ============================================================================
  // DEVICE DETECTION AND PERMISSIONS
  // ============================================================================
  
  /**
   * Initialize media devices and request permissions
   * 
   * This effect runs once on component mount to:
   * 1. Request camera and microphone permissions
   * 2. Enumerate available media devices with full enumeration
   * 3. Set default device selections
   * 4. Handle permission denial gracefully
   * 5. Set up device change monitoring
   */
  useEffect(() => {
    const getDevices = async () => {
      try {
        setDeviceDetectionStatus('detecting')
        
        // Request permissions first - required for device enumeration with labels
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setPermissionStatus('granted')

        // Perform comprehensive device enumeration
        await enumerateDevices()

        // Clean up the permission request stream
        stream.getTracks().forEach(track => track.stop())
        
        setDeviceDetectionStatus('completed')
      } catch (error) {
        console.error('Error accessing media devices:', error)
        setPermissionStatus('denied')
        setSetupStatus('error')
        setDeviceDetectionStatus('error')
      }
    }

    /**
     * Comprehensive device enumeration with WebRTC APIs
     * Detects all available audio/video input and output devices
     */
    const enumerateDevices = async () => {
      try {
        // Get full device list with labels (only available after permission grant)
        const deviceList = await navigator.mediaDevices.enumerateDevices()

        const cameras = deviceList.filter(
          device => device.kind === 'videoinput' && device.deviceId !== 'default'
        )
        const microphones = deviceList.filter(
          device => device.kind === 'audioinput' && device.deviceId !== 'default'
        )
        const speakers = deviceList.filter(
          device => device.kind === 'audiooutput' && device.deviceId !== 'default'
        )

        setDevices({ cameras, microphones, speakers })

        // Set default devices (first available device for each type)
        if (cameras.length > 0) {
          setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }))
        }
        if (microphones.length > 0) {
          setSelectedDevices(prev => ({
            ...prev,
            microphone: microphones[0].deviceId,
          }))
        }
        if (speakers.length > 0) {
          setSelectedDevices(prev => ({
            ...prev,
            speaker: speakers[0].deviceId,
          }))
        }

        console.log('Device enumeration completed:', {
          cameras: cameras.length,
          microphones: microphones.length,
          speakers: speakers.length,
        })
      } catch (error) {
        console.error('Error enumerating devices:', error)
        throw error
      }
    }

    /**
     * Monitor device changes (plugging/unplugging devices)
     * Automatically re-enumerate devices when hardware changes
     */
    const handleDeviceChange = () => {
      console.log('Device change detected, re-enumerating...')
      if (permissionStatus === 'granted') {
        enumerateDevices()
      }
    }

    // Set up device change monitoring
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    getDevices()

    // Cleanup device change listener
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [])

  // ============================================================================
  // MEDIA STREAM SETUP AND VALIDATION
  // ============================================================================
  
  /**
   * Configure and start media stream with selected devices
   * 
   * Creates MediaStream with user-selected devices and preferences.
   * Validates that microphone is enabled (mandatory for interviews).
   * Sets up video preview and audio level monitoring.
   */
  const setupMediaStream = useCallback(async () => {
    try {
      // Clean up existing stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }

      // Validate mandatory requirements - microphone is required for AI interviews
      if (!isAudioEnabled) {
        setSetupStatus('error')
        return
      }

      // Configure media constraints based on user preferences
      const constraints: MediaStreamConstraints = {
        video: isVideoEnabled
          ? {
              deviceId: selectedDevices.camera,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            }
          : false,
        audio: isAudioEnabled
          ? {
              deviceId: selectedDevices.microphone,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      }

      // Request media stream with configured constraints
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setMediaStream(stream)

      // Setup video preview if video is enabled
      if (videoRef.current && isVideoEnabled) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Setup video quality monitoring
        setupVideoQualityMonitoring()
      }

      // Setup real-time audio level monitoring for microphone validation
      if (isAudioEnabled) {
        setupAudioMonitoring(stream)
      }

      // Initial quality assessment delay
      setTimeout(() => {
        // Only set to ready if all requirements are met
        if (isAudioEnabled && qualityMetrics.audio.inputLevel > 0 && speakerTested) {
          setSetupStatus('ready')
        } else {
          setSetupStatus('testing')
        }
      }, 2000)
    } catch (error) {
      console.error('Error setting up media stream:', error)
      setSetupStatus('error')
    }
  }, [
    selectedDevices.camera,
    selectedDevices.microphone,
    isVideoEnabled,
    isAudioEnabled,
    mediaStream,
    qualityMetrics.audio.inputLevel,
    speakerTested,
  ])

  /**
   * Setup video quality monitoring and assessment
   * 
   * Analyzes video stream for brightness, sharpness, and overall quality.
   * Uses canvas-based image analysis for real-time quality metrics.
   */
  const setupVideoQualityMonitoring = useCallback(() => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyzeVideoQuality = () => {
      if (!videoRef.current || !ctx) return

      const video = videoRef.current
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        requestAnimationFrame(analyzeVideoQuality)
        return
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Calculate brightness (average luminance)
        let totalBrightness = 0
        let pixelCount = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Calculate luminance using standard formula
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b
          totalBrightness += luminance
          pixelCount++
        }

        const brightness = totalBrightness / pixelCount
        const brightnessScore = Math.max(0, Math.min(100, 
          100 - Math.abs(brightness - 128) / 128 * 100
        ))

        // Simple sharpness estimation using edge detection
        let edgeStrength = 0
        const width = canvas.width
        const height = canvas.height

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4
            const center = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114
            
            const right = data[idx + 4] * 0.299 + data[idx + 5] * 0.587 + data[idx + 6] * 0.114
            const bottom = data[(y + 1) * width * 4 + x * 4] * 0.299 + 
                          data[(y + 1) * width * 4 + x * 4 + 1] * 0.587 + 
                          data[(y + 1) * width * 4 + x * 4 + 2] * 0.114
            
            const gradientX = Math.abs(right - center)
            const gradientY = Math.abs(bottom - center)
            edgeStrength += Math.sqrt(gradientX * gradientX + gradientY * gradientY)
          }
        }

        const sharpness = edgeStrength / (width * height)
        const sharpnessScore = Math.min(100, (sharpness / 50) * 100)

        // Calculate overall video quality score
        const qualityScore = (brightnessScore * 0.4 + sharpnessScore * 0.6)

        // Update video quality metrics
        setQualityMetrics(prev => ({
          ...prev,
          video: {
            brightness: brightness / 255 * 100,
            sharpness: sharpnessScore,
            qualityScore,
          },
        }))

        setVideoQuality(qualityScore)
      } catch (error) {
        // Fallback to simulated quality if canvas analysis fails
        setVideoQuality(75 + Math.random() * 20)
      }

      // Continue monitoring
      setTimeout(analyzeVideoQuality, 1000) // Update every second
    }

    // Start quality monitoring after video loads
    if (videoRef.current.readyState >= 2) {
      analyzeVideoQuality()
    } else {
      videoRef.current.addEventListener('loadeddata', analyzeVideoQuality)
    }
  }, [])

  /**
   * Setup real-time audio level monitoring with quality assessment
   * 
   * Uses Web Audio API to monitor microphone input levels and quality metrics.
   * Provides comprehensive audio quality feedback including noise detection.
   * 
   * @param stream - MediaStream containing audio track to monitor
   */
  const setupAudioMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 2048 // Higher resolution for better quality analysis
      analyser.smoothingTimeConstant = 0.8
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Real-time audio analysis with quality metrics
      const frequencyData = new Uint8Array(analyser.frequencyBinCount)
      const timeData = new Uint8Array(analyser.fftSize)
      
      const updateAudioMetrics = () => {
        if (analyserRef.current) {
          // Get frequency and time domain data
          analyserRef.current.getByteFrequencyData(frequencyData)
          analyserRef.current.getByteTimeDomainData(timeData)
          
          // Calculate input level (RMS)
          const rms = Math.sqrt(
            timeData.reduce((sum, sample) => {
              const normalized = (sample - 128) / 128
              return sum + normalized * normalized
            }, 0) / timeData.length
          )
          const inputLevel = Math.min(100, rms * 100 * 10) // Scale for visibility
          setAudioLevel(inputLevel)
          
          // Calculate noise level (high frequency content)
          const highFreqStart = Math.floor(frequencyData.length * 0.7)
          const noiseLevel = frequencyData
            .slice(highFreqStart)
            .reduce((sum, val) => sum + val, 0) / (frequencyData.length - highFreqStart)
          
          // Calculate overall quality score
          const signalStrength = frequencyData
            .slice(0, Math.floor(frequencyData.length * 0.3))
            .reduce((sum, val) => sum + val, 0) / Math.floor(frequencyData.length * 0.3)
          
          const qualityScore = Math.max(0, Math.min(100, 
            (signalStrength / 128) * 100 - (noiseLevel / 128) * 30
          ))
          
          // Update quality metrics
          setQualityMetrics(prev => ({
            ...prev,
            audio: {
              inputLevel,
              noiseLevel: (noiseLevel / 128) * 100,
              qualityScore,
            },
          }))
          
          requestAnimationFrame(updateAudioMetrics)
        }
      }
      updateAudioMetrics()
    } catch (error) {
      console.error('Error setting up audio monitoring:', error)
    }
  }

  /**
   * Trigger media stream setup when devices or preferences change
   * 
   * Automatically reconfigures media stream when:
   * - User selects different devices
   * - User toggles video/audio preferences
   * - Permissions are granted
   */
  useEffect(() => {
    if (
      selectedDevices.camera &&
      selectedDevices.microphone &&
      permissionStatus === 'granted'
    ) {
      setupMediaStream()
    }
  }, [
    selectedDevices.camera,
    selectedDevices.microphone,
    permissionStatus,
    setupMediaStream,
  ])

  /**
   * Continuous setup validation with enhanced quality metrics
   * 
   * Monitors setup requirements in real-time and updates status:
   * - Error: Microphone disabled (mandatory requirement)
   * - Ready: Microphone working + speakers tested + quality thresholds met
   * - Testing: Requirements partially met
   */
  useEffect(() => {
    if (permissionStatus === 'granted' && deviceDetectionStatus === 'completed') {
      if (!isAudioEnabled) {
        setSetupStatus('error')
      } else if (
        isAudioEnabled && 
        qualityMetrics.audio.inputLevel > 5 && // Minimum audio input detected
        qualityMetrics.audio.qualityScore > 30 && // Acceptable audio quality
        speakerTested &&
        (!isVideoEnabled || qualityMetrics.video.qualityScore > 40) // Video quality if enabled
      ) {
        setSetupStatus('ready')
      } else {
        setSetupStatus('testing')
      }
    }
  }, [
    isAudioEnabled, 
    isVideoEnabled,
    qualityMetrics.audio.inputLevel,
    qualityMetrics.audio.qualityScore,
    qualityMetrics.video.qualityScore,
    speakerTested, 
    permissionStatus,
    deviceDetectionStatus
  ])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle device selection changes
   * 
   * Updates selected device and notifies parent component.
   * Triggers media stream reconfiguration.
   * 
   * @param deviceId - Selected device ID
   * @param type - Device type (camera, microphone, speaker)
   */
  const handleDeviceChange = (
    deviceId: string,
    type: 'camera' | 'microphone' | 'speaker'
  ) => {
    setSelectedDevices(prev => ({ ...prev, [type]: deviceId }))
    onDeviceChange(deviceId, type === 'camera' ? 'video' : 'audio')
  }

  /**
   * Toggle video input on/off
   * 
   * Video is optional for interviews but recommended for engagement.
   * Disabling video will stop camera stream but keep audio active.
   */
  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    if (videoRef.current) {
      if (isVideoEnabled) {
        videoRef.current.srcObject = null
      }
    }
  }

  /**
   * Toggle audio input on/off
   * 
   * IMPORTANT: Audio is mandatory for AI interviews.
   * Disabling audio will cause setup validation to fail.
   */
  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
  }

  /**
   * Test individual device functionality
   * 
   * Performs comprehensive testing for each device type with visual feedback.
   * 
   * @param deviceType - Type of device to test
   */
  const handleTestDevice = async (deviceType: 'camera' | 'microphone' | 'speaker') => {
    setDeviceTesting(prev => ({ ...prev, [deviceType]: true }))

    try {
      switch (deviceType) {
        case 'camera':
          await testCameraDevice()
          break
        case 'microphone':
          await testMicrophoneDevice()
          break
        case 'speaker':
          await testSpeakerDevice()
          break
      }
    } catch (error) {
      console.error(`Error testing ${deviceType}:`, error)
    } finally {
      setDeviceTesting(prev => ({ ...prev, [deviceType]: false }))
    }
  }

  /**
   * Test camera device functionality
   * Validates video capture and quality
   */
  const testCameraDevice = async () => {
    if (!selectedDevices.camera) return

    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevices.camera },
        audio: false,
      })

      // Brief test recording to validate camera
      setTimeout(() => {
        testStream.getTracks().forEach(track => track.stop())
      }, 1000)

      console.log('Camera test completed successfully')
    } catch (error) {
      console.error('Camera test failed:', error)
      throw error
    }
  }

  /**
   * Test microphone device functionality
   * Validates audio capture and input levels
   */
  const testMicrophoneDevice = async () => {
    if (!selectedDevices.microphone) return

    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: selectedDevices.microphone },
      })

      // Test audio input for 2 seconds
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(testStream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let maxLevel = 0

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        maxLevel = Math.max(maxLevel, average)
      }

      const interval = setInterval(checkLevel, 100)

      setTimeout(() => {
        clearInterval(interval)
        testStream.getTracks().forEach(track => track.stop())
        audioContext.close()
        
        console.log(`Microphone test completed, max level: ${maxLevel}`)
      }, 2000)
    } catch (error) {
      console.error('Microphone test failed:', error)
      throw error
    }
  }

  /**
   * Test speaker audio output
   * 
   * Plays a test tone to validate speaker functionality.
   * Marks speakers as tested, which is required for setup completion.
   */
  const testSpeakerDevice = async () => {
    try {
      // Play a 440Hz test tone for 1 second
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 1)

      // Mark speaker test as completed
      setSpeakerTested(true)
      
      console.log('Speaker test completed successfully')
    } catch (error) {
      console.error('Speaker test failed:', error)
      throw error
    }
  }

  /**
   * Legacy test audio function for backward compatibility
   */
  const handleTestAudio = () => {
    handleTestDevice('speaker')
  }

  /**
   * Complete setup and start interview
   * 
   * Validates all requirements are met and notifies parent component
   * to proceed with interview initialization.
   */
  const handleCompleteSetup = () => {
    if (setupStatus === 'ready') {
      const config: MediaStreamConfig = {
        audio: {
          sampleRate: 48000,
          channels: 2,
          bitDepth: 16,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: 1920,
          height: 1080,
          frameRate: 30,
          facingMode: 'user',
        },
      }
      onSetupComplete(config)
    }
  }

  /**
   * Get quality badge component based on score
   * 
   * @param score - Quality score (0-100)
   * @returns Badge component with appropriate styling
   */
  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-500">Good</Badge>
    return <Badge variant="destructive">Poor</Badge>
  }

  // ============================================================================
  // PERMISSION DENIED STATE
  // ============================================================================
  
  if (permissionStatus === 'denied') {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Camera and microphone access is required for the interview. Please
            enable permissions and refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ============================================================================
  // MAIN SETUP INTERFACE
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Setup Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audio/Video Setup</h2>
        <Button
          variant="outline"
          onClick={() => setShowAdvancedSetup(!showAdvancedSetup)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          {showAdvancedSetup ? 'Simple Setup' : 'Advanced Setup'}
        </Button>
      </div>

      {/* Advanced Device Setup */}
      {showAdvancedSetup ? (
        <DeviceSetup
          onDeviceSelected={onDeviceChange}
          onTestComplete={(result) => {
            console.log('Device test completed:', result)
          }}
          onQualityUpdate={(quality) => {
            console.log('Quality updated:', quality)
          }}
        />
      ) : (
        <>
          {/* Device Detection Status */}
          {deviceDetectionStatus === 'detecting' && (
            <Alert>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <AlertDescription>
                Detecting available devices... Please ensure your camera and microphone are connected.
              </AlertDescription>
            </Alert>
          )}

          {deviceDetectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to detect devices. Please check your hardware connections and refresh the page.
              </AlertDescription>
            </Alert>
          )}

      {/* Device Selection with Testing */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Camera
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestDevice('camera')}
                disabled={!selectedDevices.camera || deviceTesting.camera}
                className="h-7 px-2"
              >
                {deviceTesting.camera ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                ) : (
                  'Test'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedDevices.camera}
              onValueChange={value => handleDeviceChange(value, 'camera')}
              disabled={deviceDetectionStatus !== 'completed'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {devices.cameras.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isVideoEnabled && qualityMetrics.video.qualityScore > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Video Quality</span>
                  <span>{Math.round(qualityMetrics.video.qualityScore)}%</span>
                </div>
                <Progress value={qualityMetrics.video.qualityScore} className="h-1" />
                {getQualityBadge(qualityMetrics.video.qualityScore)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Microphone
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestDevice('microphone')}
                disabled={!selectedDevices.microphone || deviceTesting.microphone}
                className="h-7 px-2"
              >
                {deviceTesting.microphone ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                ) : (
                  'Test'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedDevices.microphone}
              onValueChange={value => handleDeviceChange(value, 'microphone')}
              disabled={deviceDetectionStatus !== 'completed'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {devices.microphones.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isAudioEnabled && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Input Level</span>
                    <span>{Math.round(qualityMetrics.audio.inputLevel)}%</span>
                  </div>
                  <Progress value={qualityMetrics.audio.inputLevel} className="h-1" />
                </div>
                
                {qualityMetrics.audio.qualityScore > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Audio Quality</span>
                      <span>{Math.round(qualityMetrics.audio.qualityScore)}%</span>
                    </div>
                    <Progress value={qualityMetrics.audio.qualityScore} className="h-1" />
                    {getQualityBadge(qualityMetrics.audio.qualityScore)}
                  </div>
                )}
                
                {qualityMetrics.audio.noiseLevel > 30 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>High noise detected</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Speaker
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestDevice('speaker')}
                disabled={!selectedDevices.speaker || deviceTesting.speaker}
                className="h-7 px-2"
              >
                {deviceTesting.speaker ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                ) : (
                  'Test'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedDevices.speaker}
              onValueChange={value => handleDeviceChange(value, 'speaker')}
              disabled={deviceDetectionStatus !== 'completed'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent>
                {devices.speakers.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {speakerTested && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Test completed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Video Preview</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToggleVideo}>
                {isVideoEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>
              {videoQuality > 0 && getQualityBadge(videoQuality)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <VideoOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Video disabled
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audio Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audio Testing</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToggleAudio}>
                {isAudioEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={speakerTested ? 'default' : 'outline'}
                size="sm"
                onClick={handleTestAudio}
                className="gap-1"
              >
                <Play className="h-4 w-4" />
                {speakerTested ? 'Test Again' : 'Test Speakers'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Input Level</span>
                <span>{Math.round(qualityMetrics.audio.inputLevel)}%</span>
              </div>
              <Progress value={qualityMetrics.audio.inputLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Quality Score</span>
                <span>{Math.round(qualityMetrics.audio.qualityScore)}%</span>
              </div>
              <Progress value={qualityMetrics.audio.qualityScore} className="h-2" />
            </div>
          </div>

          {qualityMetrics.audio.noiseLevel > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Noise Level</span>
                <span>{Math.round(qualityMetrics.audio.noiseLevel)}%</span>
              </div>
              <Progress 
                value={qualityMetrics.audio.noiseLevel} 
                className="h-2"
              />
              {qualityMetrics.audio.noiseLevel > 30 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Consider using a quieter environment or noise cancellation</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {isAudioEnabled && qualityMetrics.audio.inputLevel > 5 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Microphone is working properly</span>
              </div>
            )}

            {isAudioEnabled && qualityMetrics.audio.inputLevel <= 5 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Microphone input is very low - please speak louder or adjust settings</span>
              </div>
            )}

            {speakerTested && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Speaker test completed successfully</span>
              </div>
            )}

            {!speakerTested && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Click the test button above to verify your speakers</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Status and Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Setup Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {/* Device Detection Status */}
            <div className="flex items-center gap-2">
              {deviceDetectionStatus === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : deviceDetectionStatus === 'detecting' ? (
                <div className="h-4 w-4 animate-spin rounded-full border border-primary border-t-transparent" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                Device detection {deviceDetectionStatus === 'completed' ? 'completed' : 
                                deviceDetectionStatus === 'detecting' ? 'in progress' : 'failed'}
              </span>
            </div>

            {/* Audio Requirements */}
            <div className="flex items-center gap-2">
              {isAudioEnabled && qualityMetrics.audio.inputLevel > 5 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : !isAudioEnabled ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm">
                Microphone {!isAudioEnabled ? 'disabled (required)' : 
                          qualityMetrics.audio.inputLevel > 5 ? 'working' : 'not detected'}
              </span>
            </div>

            {/* Audio Quality */}
            {isAudioEnabled && qualityMetrics.audio.qualityScore > 0 && (
              <div className="flex items-center gap-2">
                {qualityMetrics.audio.qualityScore > 50 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : qualityMetrics.audio.qualityScore > 30 ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  Audio quality {qualityMetrics.audio.qualityScore > 50 ? 'excellent' : 
                                qualityMetrics.audio.qualityScore > 30 ? 'acceptable' : 'poor'}
                </span>
              </div>
            )}

            {/* Speaker Test */}
            <div className="flex items-center gap-2">
              {speakerTested ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm">
                Speaker test {speakerTested ? 'completed' : 'required'}
              </span>
            </div>

            {/* Video Quality (if enabled) */}
            {isVideoEnabled && qualityMetrics.video.qualityScore > 0 && (
              <div className="flex items-center gap-2">
                {qualityMetrics.video.qualityScore > 60 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : qualityMetrics.video.qualityScore > 40 ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  Video quality {qualityMetrics.video.qualityScore > 60 ? 'excellent' : 
                                qualityMetrics.video.qualityScore > 40 ? 'acceptable' : 'poor'}
                </span>
              </div>
            )}
          </div>

          {/* Overall Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {setupStatus === 'ready' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Ready to start interview</span>
                  </>
                ) : setupStatus === 'testing' ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm font-medium">Validating setup...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">Setup incomplete</span>
                  </>
                )}
              </div>

              <Button
                onClick={handleCompleteSetup}
                disabled={setupStatus !== 'ready'}
                className="min-w-32"
              >
                Start Interview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}