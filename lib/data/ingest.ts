// Data ingestion service for Excel and PDF files

import * as XLSX from 'xlsx'
import { Site, BaselineAssumptions, Supplier } from '@/lib/types'
import { generateId } from '@/lib/utils'

/**
 * Parse Excel file and extract site data
 */
export async function parseExcelFile(file: File | string): Promise<any> {
  let workbook: XLSX.WorkBook

  if (typeof file === 'string') {
    // File path provided
    const response = await fetch(file)
    const arrayBuffer = await response.arrayBuffer()
    workbook = XLSX.read(arrayBuffer, { type: 'array' })
  } else {
    // File object provided
    const arrayBuffer = await file.arrayBuffer()
    workbook = XLSX.read(arrayBuffer, { type: 'array' })
  }

  const result: Record<string, any[]> = {}

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    result[sheetName] = jsonData
  })

  return result
}

/**
 * Transform raw Excel data to Site objects
 */
export function transformSitesData(rawData: any[]): Site[] {
  // Assuming first row is headers
  const headers = rawData[0] as string[]
  const sites: Site[] = []

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || row.length === 0) continue

    const getCell = (header: string) => {
      const index = headers.findIndex(h => 
        h?.toLowerCase().includes(header.toLowerCase())
      )
      return index >= 0 ? row[index] : undefined
    }

    const site: Site = {
      id: generateId(),
      name: getCell('name') || getCell('site') || `Site ${i}`,
      city: getCell('city') || '',
      state: getCell('state') || '',
      areaSquareFeet: parseFloat(getCell('area') || getCell('sqft') || '0'),
      occupancy: parseInt(getCell('occupancy') || getCell('people') || '0'),
      latitude: parseFloat(getCell('lat') || getCell('latitude') || '0'),
      longitude: parseFloat(getCell('lng') || getCell('longitude') || '0'),
      measuredKWh: parseFloat(getCell('kwh') || getCell('electricity') || '0') || undefined,
      benchmarkEUI: parseFloat(getCell('eui') || '0') || undefined,
      hasTenantMetering: getCell('tenant meter') === 'Yes' || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    sites.push(site)
  }

  return sites
}

/**
 * Load default baseline assumptions
 */
export function getDefaultAssumptions(): BaselineAssumptions {
  return {
    fiscalYear: 2025,
    operationalControlBoundary: ['All managed workspace sites'],
    
    // Grid emission factors by state (kgCO2e/kWh) - India averages
    gridFactors: {
      'Delhi': 0.82,
      'Maharashtra': 0.85,
      'Karnataka': 0.75,
      'Tamil Nadu': 0.78,
      'Telangana': 0.90,
      'Gujarat': 0.88,
      'West Bengal': 0.95,
      'Uttar Pradesh': 0.87,
      'Rajasthan': 0.84,
      'Punjab': 0.81,
      'Haryana': 0.83,
      'Kerala': 0.72,
      'default': 0.82,
    },
    
    // Default EUI benchmarks by city type (kWh/sqft/year)
    euiBenchmarks: {
      'metro': 15.0,
      'tier1': 12.0,
      'tier2': 10.0,
      'default': 13.0,
    },
    
    // Fuel properties
    dieselDensity: 0.832, // kg/liter
    dieselEmissionFactor: 2.68, // kgCO2e/kg
    lpgEmissionFactor: 3.0, // kgCO2e/kg
    
    // Refrigerant GWPs
    refrigerantGWPs: {
      'R-410A': 2088,
      'R-32': 675,
      'R-134a': 1430,
      'R-407C': 1774,
      'R-22': 1810,
      'default': 1500,
    },
    
    // Embodied carbon factors (kgCO2e/kg)
    embodiedFactors: {
      concrete: 0.15,
      steel: 2.5,
      glass: 0.85,
      aluminum: 8.0,
      timber: -0.5, // Carbon sequestration
    },
  }
}

/**
 * Parse supplier scorecard data
 */
export function transformSupplierData(rawData: any[]): Supplier[] {
  const headers = rawData[0] as string[]
  const suppliers: Supplier[] = []

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || row.length === 0) continue

    const getCell = (header: string) => {
      const index = headers.findIndex(h => 
        h?.toLowerCase().includes(header.toLowerCase())
      )
      return index >= 0 ? row[index] : undefined
    }

    const hasEPD = getCell('epd') === 'Yes' || false
    const hasGHG = getCell('ghg') === 'Yes' || getCell('inventory') === 'Yes' || false
    const hasNetZero = getCell('net zero') === 'Yes' || false
    const hasCircular = getCell('circular') === 'Yes' || false

    // Calculate score (weighted criteria)
    let score = 0
    if (hasEPD) score += 30
    if (hasGHG) score += 25
    if (hasNetZero) score += 25
    if (hasCircular) score += 20

    const supplier: Supplier = {
      id: generateId(),
      name: getCell('name') || getCell('supplier') || `Supplier ${i}`,
      category: getCell('category') || 'General',
      contactEmail: getCell('email') || '',
      contactPhone: getCell('phone') || '',
      score,
      criteria: {
        hasEPD,
        hasGHGInventory: hasGHG,
        hasNetZeroCommitment: hasNetZero,
        hasCircularityProgram: hasCircular,
        certifications: [],
      },
      epdDocuments: [],
      ghgReports: [],
      correctiveActionPlans: [],
      status: score >= 70 ? 'approved' : score >= 50 ? 'pending' : 'rejected',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    suppliers.push(supplier)
  }

  return suppliers
}

/**
 * Generate seed data from provided Excel files
 */
export async function generateSeedData() {
  // Note: In production, these paths would be server-side file reads
  // For now, we'll return mock data structure
  
  const seedData = {
    sites: [
      {
        id: generateId(),
        name: 'Mumbai Central Hub',
        city: 'Mumbai',
        state: 'Maharashtra',
        areaSquareFeet: 50000,
        occupancy: 500,
        latitude: 19.0760,
        longitude: 72.8777,
        measuredKWh: 750000,
        benchmarkEUI: 15.0,
        dieselLitersPerYear: 5000,
        refrigerantType: 'R-410A',
        refrigerantKg: 100,
        refrigerantGWP: 2088,
        refrigerantAnnualLeakagePercent: 10,
        roofAreaSquareFeet: 10000,
        solarInstalledKW: 50,
        hasTenantMetering: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'Delhi NCR Campus',
        city: 'Gurugram',
        state: 'Haryana',
        areaSquareFeet: 75000,
        occupancy: 800,
        latitude: 28.4595,
        longitude: 77.0266,
        measuredKWh: 1125000,
        benchmarkEUI: 15.0,
        dieselLitersPerYear: 8000,
        refrigerantType: 'R-32',
        refrigerantKg: 150,
        refrigerantGWP: 675,
        refrigerantAnnualLeakagePercent: 8,
        roofAreaSquareFeet: 15000,
        solarInstalledKW: 100,
        hasTenantMetering: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'Bangalore Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        areaSquareFeet: 60000,
        occupancy: 650,
        latitude: 12.9716,
        longitude: 77.5946,
        measuredKWh: 900000,
        benchmarkEUI: 15.0,
        dieselLitersPerYear: 4000,
        refrigerantType: 'R-410A',
        refrigerantKg: 120,
        refrigerantGWP: 2088,
        refrigerantAnnualLeakagePercent: 10,
        roofAreaSquareFeet: 12000,
        solarInstalledKW: 75,
        hasTenantMetering: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    suppliers: [
      {
        id: generateId(),
        name: 'Green Building Materials Ltd',
        category: 'Construction Materials',
        contactEmail: 'contact@greenbm.com',
        contactPhone: '+91-9876543210',
        score: 85,
        criteria: {
          hasEPD: true,
          hasGHGInventory: true,
          hasNetZeroCommitment: true,
          hasCircularityProgram: true,
          certifications: ['ISO 14001', 'LEED'],
        },
        epdDocuments: [],
        ghgReports: [],
        correctiveActionPlans: [],
        status: 'approved' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'EcoTech HVAC Solutions',
        category: 'HVAC & Refrigeration',
        contactEmail: 'info@ecotechhvac.com',
        contactPhone: '+91-9876543211',
        score: 75,
        criteria: {
          hasEPD: true,
          hasGHGInventory: true,
          hasNetZeroCommitment: true,
          hasCircularityProgram: false,
          certifications: ['ISO 14001'],
        },
        epdDocuments: [],
        ghgReports: [],
        correctiveActionPlans: [],
        status: 'approved' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    assumptions: getDefaultAssumptions(),
  }

  return seedData
}

