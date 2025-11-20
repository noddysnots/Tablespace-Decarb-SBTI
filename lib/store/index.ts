// Global state management with Zustand

import { create } from 'zustand'
import { Site, Scenario, Supplier, BaselineAssumptions, Emissions } from '@/lib/types'
import { getDefaultAssumptions } from '@/lib/data/ingest'
import { calculatePortfolioEmissions } from '@/lib/calculations/emissions'

interface AppState {
  // Data
  sites: Site[]
  scenarios: Scenario[]
  suppliers: Supplier[]
  assumptions: BaselineAssumptions
  currentScenario: Scenario | null
  
  // UI State
  sidebarOpen: boolean
  selectedSiteId: string | null
  
  // Actions
  setSites: (sites: Site[]) => void
  addSite: (site: Site) => void
  updateSite: (id: string, updates: Partial<Site>) => void
  deleteSite: (id: string) => void
  
  setScenarios: (scenarios: Scenario[]) => void
  addScenario: (scenario: Scenario) => void
  updateScenario: (id: string, updates: Partial<Scenario>) => void
  deleteScenario: (id: string) => void
  setCurrentScenario: (scenario: Scenario | null) => void
  
  setSuppliers: (suppliers: Supplier[]) => void
  addSupplier: (supplier: Supplier) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  
  setAssumptions: (assumptions: BaselineAssumptions) => void
  
  setSidebarOpen: (open: boolean) => void
  setSelectedSiteId: (id: string | null) => void
  
  // Computed
  getPortfolioEmissions: () => { totalEmissions: Emissions; siteEmissions: Record<string, Emissions> }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  sites: [],
  scenarios: [],
  suppliers: [],
  assumptions: getDefaultAssumptions(),
  currentScenario: null,
  sidebarOpen: true,
  selectedSiteId: null,
  
  // Site actions
  setSites: (sites) => set({ sites }),
  addSite: (site) => set((state) => ({ sites: [...state.sites, site] })),
  updateSite: (id, updates) =>
    set((state) => ({
      sites: state.sites.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteSite: (id) =>
    set((state) => ({ sites: state.sites.filter((s) => s.id !== id) })),
  
  // Scenario actions
  setScenarios: (scenarios) => set({ scenarios }),
  addScenario: (scenario) =>
    set((state) => ({ scenarios: [...state.scenarios, scenario] })),
  updateScenario: (id, updates) =>
    set((state) => ({
      scenarios: state.scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteScenario: (id) =>
    set((state) => ({ scenarios: state.scenarios.filter((s) => s.id !== id) })),
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  
  // Supplier actions
  setSuppliers: (suppliers) => set({ suppliers }),
  addSupplier: (supplier) =>
    set((state) => ({ suppliers: [...state.suppliers, supplier] })),
  updateSupplier: (id, updates) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  
  // Assumptions
  setAssumptions: (assumptions) => set({ assumptions }),
  
  // UI actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedSiteId: (id) => set({ selectedSiteId: id }),
  
  // Computed values
  getPortfolioEmissions: () => {
    const { sites, assumptions } = get()
    return calculatePortfolioEmissions(sites, assumptions)
  },
}))

