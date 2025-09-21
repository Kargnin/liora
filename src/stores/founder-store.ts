import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CompanyDetailsFormData } from '@/types'
import type { UploadedFile } from '@/types/upload'

interface FounderState {
  // Company data
  companyData: Partial<CompanyDetailsFormData>
  
  // Upload state
  uploadedFiles: {
    pitchDeck?: UploadedFile[]
    pitchVideo?: UploadedFile[]
    pitchAudio?: UploadedFile[]
  }
  
  // Form state
  currentStep: number
  isFormComplete: boolean
  lastSaved: string | null
  
  // Analysis state
  analysisStatus: 'pending' | 'in-progress' | 'completed' | 'error'
  analysisProgress: number
  
  // Actions
  updateCompanyData: (data: Partial<CompanyDetailsFormData>) => void
  setUploadedFiles: (type: 'pitchDeck' | 'pitchVideo' | 'pitchAudio', files: UploadedFile[]) => void
  setCurrentStep: (step: number) => void
  setFormComplete: (complete: boolean) => void
  setAnalysisStatus: (status: 'pending' | 'in-progress' | 'completed' | 'error') => void
  setAnalysisProgress: (progress: number) => void
  resetFounderData: () => void
  saveCompanyData: () => Promise<void>
}

const initialState = {
  companyData: {},
  uploadedFiles: {},
  currentStep: 0,
  isFormComplete: false,
  lastSaved: null,
  analysisStatus: 'pending' as const,
  analysisProgress: 0
}

export const useFounderStore = create<FounderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateCompanyData: (data: Partial<CompanyDetailsFormData>) => {
        set(state => ({
          companyData: { ...state.companyData, ...data },
          lastSaved: new Date().toISOString()
        }))
      },

      setUploadedFiles: (type: 'pitchDeck' | 'pitchVideo' | 'pitchAudio', files: UploadedFile[]) => {
        set(state => ({
          uploadedFiles: {
            ...state.uploadedFiles,
            [type]: files
          }
        }))
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step })
      },

      setFormComplete: (complete: boolean) => {
        set({ isFormComplete: complete })
      },

      setAnalysisStatus: (status: 'pending' | 'in-progress' | 'completed' | 'error') => {
        set({ analysisStatus: status })
      },

      setAnalysisProgress: (progress: number) => {
        set({ analysisProgress: Math.min(Math.max(progress, 0), 100) })
      },

      resetFounderData: () => {
        set(initialState)
      },

      saveCompanyData: async () => {
        const { companyData, uploadedFiles } = get()
        
        try {
          // In a real app, this would make an API call to save the data
          // For now, we'll simulate the save operation
          console.log('Saving company data:', { companyData, uploadedFiles })
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set({ lastSaved: new Date().toISOString() })
          
          return Promise.resolve()
        } catch (error) {
          console.error('Failed to save company data:', error)
          throw error
        }
      }
    }),
    {
      name: 'liora-founder',
      partialize: (state) => ({
        companyData: state.companyData,
        uploadedFiles: state.uploadedFiles,
        currentStep: state.currentStep,
        isFormComplete: state.isFormComplete,
        lastSaved: state.lastSaved,
        analysisStatus: state.analysisStatus,
        analysisProgress: state.analysisProgress
      })
    }
  )
)