import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InvestorPreferences, CompanyOverview, InvestmentMemo, CompanyFilters } from '@/types'

interface InvestorState {
  preferences: InvestorPreferences | null
  companies: CompanyOverview[]
  selectedCompany: InvestmentMemo | null
  filters: CompanyFilters
  isPreferencesSetupComplete: boolean
  
  // Actions
  setPreferences: (preferences: InvestorPreferences) => void
  updatePreferences: (updates: Partial<InvestorPreferences>) => void
  setFilters: (filters: CompanyFilters) => void
  setCompanies: (companies: CompanyOverview[]) => void
  setSelectedCompany: (company: InvestmentMemo | null) => void
  resetPreferences: () => void
  markPreferencesComplete: () => void
}

const defaultFilters: CompanyFilters = {
  sectors: [],
  stages: [],
  fundingRange: {
    min: 0,
    max: 100000000
  },
  location: '',
  searchQuery: ''
}

export const useInvestorStore = create<InvestorState>()(
  persist(
    (set, get) => ({
      preferences: null,
      companies: [],
      selectedCompany: null,
      filters: defaultFilters,
      isPreferencesSetupComplete: false,
      
      setPreferences: (preferences) => 
        set({ 
          preferences, 
          isPreferencesSetupComplete: true 
        }),
      
      updatePreferences: (updates) => 
        set((state) => ({
          preferences: state.preferences 
            ? { ...state.preferences, ...updates }
            : null
        })),
      
      setFilters: (filters) => set({ filters }),
      
      setCompanies: (companies) => set({ companies }),
      
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      
      resetPreferences: () => 
        set({ 
          preferences: null, 
          isPreferencesSetupComplete: false,
          filters: defaultFilters 
        }),
      
      markPreferencesComplete: () => 
        set({ isPreferencesSetupComplete: true })
    }),
    {
      name: 'liora-investor-store',
      partialize: (state) => ({
        preferences: state.preferences,
        isPreferencesSetupComplete: state.isPreferencesSetupComplete,
        filters: state.filters
      })
    }
  )
)