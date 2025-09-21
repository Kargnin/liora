// Application configuration
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },

  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800'), // 50MB
    maxVideoSize: parseInt(
      process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE || '524288000'
    ), // 500MB
    acceptedFileTypes: {
      documents: ['.pdf', '.ppt', '.pptx'],
      media: ['.mp4', '.mp3', '.wav'],
      images: ['.jpg', '.jpeg', '.png', '.webp'],
    },
  },

  ai: {
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },

  app: {
    name: 'Liora',
    description: 'AI-Powered Investor-Founder Matching Platform',
    version: '1.0.0',
  },

  features: {
    enableAIInterview: true,
    enableRealTimeNotifications: true,
    enableFileUpload: true,
  },
} as const

export type Config = typeof config
