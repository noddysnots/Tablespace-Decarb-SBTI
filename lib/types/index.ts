// Core data types for the decarbonization platform

export interface Site {
  id: string
  name: string
  city: string
  state: string
  areaSquareFeet: number
  occupancy: number
  latitude: number
  longitude: number
  
  // Energy data
  measuredKWh?: number
  benchmarkEUI?: number // kWh/sqft/year
  
  // HVAC & Equipment
  hvacSpec?: string
  chillerEfficiency?: number
  
  // DG & Fuel
  dgCapacityKW?: number
  dieselLitersPerYear?: number
  lpgKgPerYear?: number
  
  // Refrigerants
  refrigerantType?: string
  refrigerantKg?: number
  refrigerantGWP?: number
  refrigerantAnnualLeakagePercent?: number
  
  // Renewables
  roofAreaSquareFeet?: number
  solarInstalledKW?: number
  
  // Tenant metering
  hasTenantMetering: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface Emissions {
  scope1: number // tCO2e
  scope2LocationBased: number // tCO2e
  scope2MarketBased: number // tCO2e
  scope3: number // tCO2e
  total: number // tCO2e
  eui: number // kWh/sqft/year
  renewablePercent: number
  embodiedCarbonPerSqFt: number // kgCO2e/sqft
}

export interface EmissionsBySource {
  electricity: number
  diesel: number
  lpg: number
  refrigerants: number
  embodiedCarbon: number
  commuting: number
  other: number
}

export interface BaselineAssumptions {
  fiscalYear: number
  operationalControlBoundary: string[]
  
  // Grid emission factors by state (kgCO2e/kWh)
  gridFactors: Record<string, number>
  
  // Default EUI benchmarks by city type (kWh/sqft/year)
  euiBenchmarks: Record<string, number>
  
  // Fuel properties
  dieselDensity: number // kg/liter
  dieselEmissionFactor: number // kgCO2e/kg
  lpgEmissionFactor: number // kgCO2e/kg
  
  // Refrigerant GWPs
  refrigerantGWPs: Record<string, number>
  
  // Embodied carbon factors (kgCO2e/kg or kgCO2e/unit)
  embodiedFactors: {
    concrete: number
    steel: number
    glass: number
    aluminum: number
    timber: number
  }
}

export interface Intervention {
  id: string
  name: string
  category: 'efficiency' | 'renewables' | 'fuel-switch' | 'embodied' | 'other'
  description: string
  
  // Impact parameters
  energySavingsPercent?: number
  emissionReductionPercent?: number
  solarKWToInstall?: number
  ppaPercentOfLoad?: number
  embodiedReductionPercent?: number
  
  // Financial
  capexINR?: number
  opexAnnualINR?: number
  savingsAnnualINR?: number
  
  // Timeline
  implementationYear: number
  lifespanYears: number
}

export interface Scenario {
  id: string
  name: string
  description: string
  baselineYear: number
  targetYear: number
  
  // SBTi targets
  nearTermTarget2030Percent: number // % reduction from baseline
  longTermTarget2040Percent: number // % reduction from baseline
  
  // Interventions
  interventions: Intervention[]
  
  // Results (calculated)
  yearlyEmissions?: Record<number, Emissions>
  sbtiCompliant?: boolean
  totalCapex?: number
  totalNPV?: number
  
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  name: string
  category: string
  contactEmail: string
  contactPhone: string
  
  // Scorecard
  score: number // 0-100
  criteria: {
    hasEPD: boolean
    hasGHGInventory: boolean
    hasNetZeroCommitment: boolean
    hasCircularityProgram: boolean
    certifications: string[]
  }
  
  // Documents
  epdDocuments: string[]
  ghgReports: string[]
  correctiveActionPlans: string[]
  
  status: 'pending' | 'approved' | 'rejected'
  
  createdAt: Date
  updatedAt: Date
}

export interface PrioritizationItem {
  id: string
  intervention: string
  impact: number // 1-10
  feasibility: number // 1-10
  capex: number
  opex: number
  savingsAnnual: number
  paybackYears: number
  npv: number
}

export interface EmbodiedCarbonProject {
  id: string
  name: string
  siteId: string
  areaSquareFeet: number
  projectType: 'new-construction' | 'fit-out' | 'renovation'
  
  materials: {
    category: string
    quantity: number
    unit: string
    embodiedFactor: number // kgCO2e/unit
    reusePercent: number
    totalEmissions: number // kgCO2e
  }[]
  
  transportDistance: number // km
  transportEmissions: number // kgCO2e
  
  totalEmbodiedCarbon: number // kgCO2e
  embodiedCarbonPerSqFt: number // kgCO2e/sqft
  budgetPerSqFt: number // kgCO2e/sqft
  withinBudget: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface CommutingData {
  siteId: string
  
  employees: {
    mode: 'car' | 'motorcycle' | 'bus' | 'metro' | 'bike' | 'walk'
    count: number
    avgDistanceKm: number
    daysPerWeek: number
  }[]
  
  totalEmissions: number // tCO2e/year
  avgCommuteDistance: number // km
}

export interface ExportOptions {
  format: 'pptx' | 'xlsx' | 'pdf'
  includeCharts: boolean
  includeDataTables: boolean
  includeSupplierScorecard: boolean
  scenarioIds: string[]
}

export interface DataGap {
  siteId: string
  siteName: string
  gaps: {
    category: string
    field: string
    severity: 'high' | 'medium' | 'low'
    recommendation: string
  }[]
}

export interface TimeSeriesDataPoint {
  year: number
  emissions: number
  target?: number
  scenario: string
}

export interface KPITile {
  title: string
  value: string | number
  unit: string
  change?: number // percentage change from previous period
  trend?: 'up' | 'down' | 'stable'
  icon: string
}

