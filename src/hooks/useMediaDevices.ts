// "use client"

// import { useState, useEffect, useCallback, useRef } from 'react'
// import type { 
//   MediaDevice, 
//   DeviceTestResult, 
//   AudioLevelMeter, 
//   VideoQualityIndicator,
//   MediaStreamConfig 
// } from '@/types/interview'

// interface UseMediaDevicesReturn {
//   devices: {
//     audioInput: MediaDevice[]
//     audioOutput: MediaDevice[]
//     videoInput: MediaDevice[]
//   }
//   selectedDevices: {
//     audioInput?: string
//     audioOutput?: string
//     videoInput?: string
//   }
//   isLoading: boolean
//   error: string | null
//   audioLevels: AudioLevelMeter
//   videoQuality: VideoQualityIndicator
//   previewStream: MediaStream | null
//   enumerateDevices: () => Promise<void>
//   selectDevice: (deviceId: string, type: 'audioinput' | 'audiooutput' | 'videoinput') => void
//   testDevice: (deviceId: string, type: 'audio' | 'video') => Promise<DeviceTestResult>
//   startPreview: () => Promise<void>
//   stopPreview: () => void
//   getMediaConfig: () => MediaStreamConfig
// }

// export function useMediaDevices(): UseMediaDevicesReturn {
//   const [devices, setDevices] = useState<UseMediaDevicesReturn['devices']>({
//     audioInput: [],
//     audioOutput: [],
//     videoInput: []
//   })
  
//   const [selectedDevices, setSelectedDevices] = useState<UseMediaDevicesReturn['selectedDevices']>({})
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  
//   const [audioLevels, setAudioLevels] = useState<AudioLevelMeter>({
//     inputLevel: 0,
//     outputLevel: 0,
//     noiseLevel: 0,
//     isActive: false
//   })
  
//   const [videoQuality, setVideoQuality] = useState<VideoQualityIndicator>({
//     resolution: '0x0',
//     frameRate: 0,
//     brightness: 0,
//     quality: 'poor',
//     issues: []
//   })

//   const audioContextRef = useRef<AudioContext | null>(null)
//   const analyserRef = useRef<AnalyserNode | null>(null)
//   const animationFrameRef = useRef<number | null>(null)

//   // Enumerate available media devices
//   const enumerateDevices = useCallback(async () => {
//     setIsLoading(true)
//     setError(null)
    
//     try {
//       // Request permissions first
//       await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      
//       const deviceList = await navigator.mediaDevices.enumerateDevices()
      
//       const categorizedDevices = deviceList.reduce(
//         (acc, device) => {
//           const mediaDevice: MediaDevice = {
//             deviceId: device.deviceId,
//             label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
//             kind: device.kind as MediaDevice['kind'],
//             groupId: device.groupId
//           }
          
//           switch (device.kind) {
//             case 'audioinput':
//               acc.audioInput.push(mediaDevice)
//               break
//             case 'audiooutput':
//               acc.audioOutput.push(mediaDevice)
//               break
//             case 'videoinput':
//               acc.videoInput.push(mediaDevice)
//               break
//           }
          
//           return acc
//         },
//         { audioInput: [], audioOutput: [], videoInput: [] } as UseMediaDevicesReturn['devices']
//       )
      
//       setDevices(categorizedDevices)
      
//       // Auto-select first available devices
//       if (categorizedDevices.audioInput.length > 0 && !selectedDevices.audioInput) {
//         setSelectedDevices(prev => ({ ...prev, audioInput: categorizedDevices.audioInput[0].deviceId }))
//       }
//       if (categorizedDevices.audioOutput.length > 0 && !selectedDevices.audioOutput) {
//         setSelectedDevices(prev => ({ ...prev, audioOutput: categorizedDevices.audioOutput[0].deviceId }))
//       }
//       if (categorizedDevices.videoInput.length > 0 && !selectedDevices.videoInput) {
//         setSelectedDevices(prev => ({ ...prev, videoInput: categorizedDevices.videoInput[0].deviceId }))
//       }
      
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to enumerate devices'
//       setError(errorMessage)
//       console.error('Device enumeration error:', err)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [selectedDevices])

//   // Select a specific device
//   const selectDevice = useCallback((deviceId: string, type: 'audioinput' | 'audiooutput' | 'videoinput') => {
//     setSelectedDevices(prev => ({
//       ...prev,
//       [type === 'audioinput' ? 'audioInput' : type === 'audiooutput' ? 'audioOutput' : 'videoInput']: deviceId
//     }))
//   }, [])

//   // Test device functionality and quality
//   const testDevice = useCallback(async (deviceId: string, type: 'audio' | 'video'): Promise<DeviceTestResult> => {
//     const result: DeviceTestResult = {
//       deviceId,
//       type,
//       quality: 'poor',
//       issues: [],
//       recommendations: []
//     }

//     try {
//       if (type === 'audio') {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: { deviceId: { exact: deviceId } }
//         })
        
//         // Test audio levels and quality
//         const audioContext = new AudioContext()
//         const source = audioContext.createMediaStreamSource(stream)
//         const analyser = audioContext.createAnalyser()
//         source.connect(analyser)
        
//         analyser.fftSize = 256
//         const bufferLength = analyser.frequencyBinCount
//         const dataArray = new Uint8Array(bufferLength)
        
//         // Sample audio for 2 seconds
//         await new Promise(resolve => setTimeout(resolve, 2000))
        
//         analyser.getByteFrequencyData(dataArray)
//         const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
        
//         if (average > 50) {
//           result.quality = 'excellent'
//         } else if (average > 30) {
//           result.quality = 'good'
//         } else if (average > 10) {
//           result.quality = 'fair'
//           result.issues.push('Low audio input level')
//           result.recommendations.push('Check microphone position and volume settings')
//         } else {
//           result.quality = 'poor'
//           result.issues.push('Very low or no audio input detected')
//           result.recommendations.push('Verify microphone is connected and not muted')
//         }
        
//         stream.getTracks().forEach(track => track.stop())
//         audioContext.close()
        
//       } else if (type === 'video') {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { deviceId: { exact: deviceId } }
//         })
        
//         const videoTrack = stream.getVideoTracks()[0]
//         const settings = videoTrack.getSettings()
        
//         result.quality = 'good' // Default for video if stream is obtained
        
//         if (settings.width && settings.height) {
//           const resolution = settings.width * settings.height
//           if (resolution >= 1920 * 1080) {
//             result.quality = 'excellent'
//           } else if (resolution >= 1280 * 720) {
//             result.quality = 'good'
//           } else if (resolution >= 640 * 480) {
//             result.quality = 'fair'
//             result.issues.push('Low video resolution')
//             result.recommendations.push('Consider using a higher resolution camera')
//           } else {
//             result.quality = 'poor'
//             result.issues.push('Very low video resolution')
//             result.recommendations.push('Upgrade to a better camera for optimal experience')
//           }
//         }
        
//         stream.getTracks().forEach(track => track.stop())
//       }
      
//     } catch (err) {
//       result.quality = 'poor'
//       result.issues.push(`Failed to access ${type} device`)
//       result.recommendations.push(`Check ${type} device permissions and connection`)
//       console.error(`Device test error for ${type}:`, err)
//     }

//     return result
//   }, [])

//   // Start preview with selected devices
//   const startPreview = useCallback(async () => {
//     try {
//       setError(null)
      
//       const constraints: MediaStreamConstraints = {
//         audio: selectedDevices.audioInput ? { deviceId: { exact: selectedDevices.audioInput } } : true,
//         video: selectedDevices.videoInput ? { deviceId: { exact: selectedDevices.videoInput } } : true
//       }
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints)
//       setPreviewStream(stream)
      
//       // Set up audio level monitoring
//       if (stream.getAudioTracks().length > 0) {
//         audioContextRef.current = new AudioContext()
//         const source = audioContextRef.current.createMediaStreamSource(stream)
//         analyserRef.current = audioContextRef.current.createAnalyser()
//         source.connect(analyserRef.current)
        
//         analyserRef.current.fftSize = 256
        
//         const updateAudioLevels = () => {
//           if (!analyserRef.current) return
          
//           const bufferLength = analyserRef.current.frequencyBinCount
//           const dataArray = new Uint8Array(bufferLength)
//           analyserRef.current.getByteFrequencyData(dataArray)
          
//           const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
//           const inputLevel = Math.min(100, (average / 128) * 100)
          
//           setAudioLevels(prev => ({
//             ...prev,
//             inputLevel,
//             isActive: inputLevel > 5
//           }))
          
//           animationFrameRef.current = requestAnimationFrame(updateAudioLevels)
//         }
        
//         updateAudioLevels()
//       }
      
//       // Set up video quality monitoring
//       if (stream.getVideoTracks().length > 0) {
//         const videoTrack = stream.getVideoTracks()[0]
//         const settings = videoTrack.getSettings()
        
//         setVideoQuality({
//           resolution: `${settings.width || 0}x${settings.height || 0}`,
//           frameRate: settings.frameRate || 0,
//           brightness: 75, // Mock brightness value
//           quality: settings.width && settings.width >= 1280 ? 'excellent' : 'good',
//           issues: []
//         })
//       }
      
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to start preview'
//       setError(errorMessage)
//       console.error('Preview start error:', err)
//     }
//   }, [selectedDevices])

//   // Stop preview and cleanup
//   const stopPreview = useCallback(() => {
//     if (previewStream) {
//       previewStream.getTracks().forEach(track => track.stop())
//       setPreviewStream(null)
//     }
    
//     if (audioContextRef.current) {
//       audioContextRef.current.close()
//       audioContextRef.current = null
//     }
    
//     if (analyserRef.current) {
//       analyserRef.current = null
//     }
    
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current)
//       animationFrameRef.current = null
//     }
    
//     setAudioLevels({
//       inputLevel: 0,
//       outputLevel: 0,
//       noiseLevel: 0,
//       isActive: false
//     })
    
//     setVideoQuality({
//       resolution: '0x0',
//       frameRate: 0,
//       brightness: 0,
//       quality: 'poor',
//       issues: []
//     })
//   }, [previewStream])

//   // Get current media configuration
//   const getMediaConfig = useCallback((): MediaStreamConfig => {
//     return {
//       audio: {
//         sampleRate: 48000,
//         channels: 2,
//         bitDepth: 16,
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl: true
//       },
//       video: {
//         width: 1920,
//         height: 1080,
//         frameRate: 30,
//         facingMode: 'user'
//       }
//     }
//   }, [])

//   // Initialize devices on mount
//   useEffect(() => {
//     enumerateDevices()
    
//     // Listen for device changes
//     const handleDeviceChange = () => {
//       enumerateDevices()
//     }
    
//     navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    
//     return () => {
//       navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
//       stopPreview()
//     }
//   }, [enumerateDevices, stopPreview])

//   return {
//     devices,
//     selectedDevices,
//     isLoading,
//     error,
//     audioLevels,
//     videoQuality,
//     previewStream,
//     enumerateDevices,
//     selectDevice,
//     testDevice,
//     startPreview,
//     stopPreview,
//     getMediaConfig
//   }
// }