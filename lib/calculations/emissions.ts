// Core calculation primitives for emission calculations
// Implements exact formulas as specified in requirements

import { BaselineAssumptions, Site, Emissions, EmissionsBySource } from '@/lib/types'

/**
 * Calculate electricity emissions
 * Formula: kgCO2e = kWh * emission_factor
 */
export function calculateElectricityEmissions(
  kWh: number,
  emissionFactor: number // kgCO2e/kWh
): number {
  return kWh * emissionFactor
}

/**
 * Calculate fuel combustion emissions
 * Formula: kgCO2e = liters * density * EF
 */
export function calculateFuelEmissions(
  liters: number,
  density: number, // kg/liter
  emissionFactor: number // kgCO2e/kg
): number {
  return liters * density * emissionFactor
}

/**
 * Calculate refrigerant fugitive emissions
 * Formula: kgCO2e = kg_refrigerant * GWP
 */
export function calculateRefrigerantEmissions(
  kgRefrigerant: number,
  gwp: number,
  annualLeakagePercent: number = 10 // default 10% annual leakage
): number {
  const leakedKg = kgRefrigerant * (annualLeakagePercent / 100)
  return leakedKg * gwp
}

/**
 * Calculate embodied carbon
 * Formula: kgCO2e = mass * CF or aggregate by material
 */
export function calculateEmbodiedCarbon(
  materials: { mass: number; carbonFactor: number }[]
): number {
  return materials.reduce((total, material) => {
    return total + material.mass * material.carbonFactor
  }, 0)
}

/**
 * Calculate tenant commuting emissions
 * Formula: tCO2e = sum(person_km_by_mode * EF_mode)
 */
export function calculateCommutingEmissions(
  commutes: { mode: string; personKm: number }[],
  emissionFactors: Record<string, number> // kgCO2e/person-km
): number {
  const totalKgCO2e = commutes.reduce((total, commute) => {
    const factor = emissionFactors[commute.mode] || 0
    return total + commute.personKm * factor
  }, 0)
  return totalKgCO2e / 1000 // Convert to tCO2e
}

/**
 * Calculate comprehensive site emissions
 */
export function calculateSiteEmissions(
  site: Site,
  assumptions: BaselineAssumptions
): { emissions: Emissions; breakdown: EmissionsBySource } {
  // Get grid emission factor for site location
  const gridFactor = assumptions.gridFactors[site.state] || 0.82 // default India grid factor

  // Calculate annual electricity consumption
  let annualKWh = site.measuredKWh || 0
  if (!annualKWh && site.benchmarkEUI) {
    annualKWh = site.benchmarkEUI * site.areaSquareFeet
  }

  // Scope 2: Electricity emissions
  const electricityEmissions = calculateElectricityEmissions(annualKWh, gridFactor)

  // Scope 1: Fuel combustion
  const dieselEmissions = site.dieselLitersPerYear
    ? calculateFuelEmissions(
        site.dieselLitersPerYear,
        assumptions.dieselDensity,
        assumptions.dieselEmissionFactor
      )
    : 0

  const lpgEmissions = site.lpgKgPerYear
    ? site.lpgKgPerYear * assumptions.lpgEmissionFactor
    : 0

  // Scope 1: Refrigerant fugitive emissions
  const refrigerantEmissions = site.refrigerantKg && site.refrigerantGWP
    ? calculateRefrigerantEmissions(
        site.refrigerantKg,
        site.refrigerantGWP,
        site.refrigerantAnnualLeakagePercent
      )
    : 0

  const scope1 = (dieselEmissions + lpgEmissions + refrigerantEmissions) / 1000 // Convert to tCO2e

  // Scope 2
  const scope2LocationBased = electricityEmissions / 1000 // Convert to tCO2e
  const scope2MarketBased = scope2LocationBased // Same unless PPAs

  // Scope 3: Placeholder for now (commuting, embodied, etc.)
  const scope3 = 0

  // Calculate EUI
  const eui = annualKWh / site.areaSquareFeet

  // Calculate renewable percentage
  const solarGeneration = (site.solarInstalledKW || 0) * 1200 // Assume 1200 kWh/kW/year
  const renewablePercent = annualKWh > 0 ? (solarGeneration / annualKWh) * 100 : 0

  const emissions: Emissions = {
    scope1,
    scope2LocationBased,
    scope2MarketBased,
    scope3,
    total: scope1 + scope2LocationBased + scope3,
    eui,
    renewablePercent,
    embodiedCarbonPerSqFt: 0, // Calculated separately
  }

  const breakdown: EmissionsBySource = {
    electricity: electricityEmissions / 1000,
    diesel: dieselEmissions / 1000,
    lpg: lpgEmissions / 1000,
    refrigerants: refrigerantEmissions / 1000,
    embodiedCarbon: 0,
    commuting: 0,
    other: 0,
  }

  return { emissions, breakdown }
}

/**
 * Calculate portfolio-level emissions
 */
export function calculatePortfolioEmissions(
  sites: Site[],
  assumptions: BaselineAssumptions
): { totalEmissions: Emissions; siteEmissions: Record<string, Emissions> } {
  const siteEmissions: Record<string, Emissions> = {}
  
  const totalEmissions: Emissions = {
    scope1: 0,
    scope2LocationBased: 0,
    scope2MarketBased: 0,
    scope3: 0,
    total: 0,
    eui: 0,
    renewablePercent: 0,
    embodiedCarbonPerSqFt: 0,
  }

  let totalArea = 0
  let totalKWh = 0
  let totalSolarGeneration = 0

  sites.forEach(site => {
    const { emissions } = calculateSiteEmissions(site, assumptions)
    siteEmissions[site.id] = emissions

    totalEmissions.scope1 += emissions.scope1
    totalEmissions.scope2LocationBased += emissions.scope2LocationBased
    totalEmissions.scope2MarketBased += emissions.scope2MarketBased
    totalEmissions.scope3 += emissions.scope3

    totalArea += site.areaSquareFeet
    const siteKWh = (site.measuredKWh || site.benchmarkEUI ? site.benchmarkEUI! * site.areaSquareFeet : 0)
    totalKWh += siteKWh
    totalSolarGeneration += (site.solarInstalledKW || 0) * 1200
  })

  totalEmissions.total = totalEmissions.scope1 + totalEmissions.scope2LocationBased + totalEmissions.scope3
  totalEmissions.eui = totalArea > 0 ? totalKWh / totalArea : 0
  totalEmissions.renewablePercent = totalKWh > 0 ? (totalSolarGeneration / totalKWh) * 100 : 0

  return { totalEmissions, siteEmissions }
}

/**
 * Calculate SBTi-aligned target trajectory
 * 1.5°C-aligned: ~4.2% annual reduction, net-zero by 2040
 */
export function calculateSBTiTrajectory(
  baselineYear: number,
  baselineEmissions: number,
  targetYear: number,
  reductionPercent: number
): Record<number, number> {
  const trajectory: Record<number, number> = {}
  const years = targetYear - baselineYear

  for (let i = 0; i <= years; i++) {
    const year = baselineYear + i
    const yearFraction = i / years
    // Linear reduction for simplicity (can be made more sophisticated)
    const reduction = reductionPercent * yearFraction
    trajectory[year] = baselineEmissions * (1 - reduction / 100)
  }

  return trajectory
}

/**
 * Check if scenario meets SBTi compliance
 */
export function checkSBTiCompliance(
  scenarioEmissions: Record<number, number>,
  targetTrajectory: Record<number, number>,
  tolerance: number = 0.05 // 5% tolerance
): boolean {
  for (const year in targetTrajectory) {
    const target = targetTrajectory[year]
    const actual = scenarioEmissions[year]
    
    if (actual > target * (1 + tolerance)) {
      return false
    }
  }
  
  return true
}

