// Scenario simulation engine with intervention modeling

import {
  Scenario,
  Intervention,
  Site,
  Emissions,
  BaselineAssumptions,
} from '@/lib/types'
import { calculateSiteEmissions, calculateSBTiTrajectory, checkSBTiCompliance } from './emissions'

interface SimulationState {
  baselineKWh: number
  currentKWh: number
  solarKW: number
  ppaPercent: number
  gridFactor: number
  embodiedReductionPercent: number
}

/**
 * Simulate a scenario year-by-year with interventions
 * Handles double-counting: efficiency reduces baseline before RE displaces grid
 */
export function simulateScenario(
  scenario: Scenario,
  sites: Site[],
  assumptions: BaselineAssumptions
): {
  yearlyEmissions: Record<number, Emissions>
  sbtiCompliant: boolean
  interventionImpact: Record<string, number>
} {
  const startYear = scenario.baselineYear
  const endYear = scenario.targetYear
  const yearlyEmissions: Record<number, Emissions> = {}
  const interventionImpact: Record<string, number> = {}

  // Calculate baseline emissions
  let baselineTotal = 0
  const siteStates: Record<string, SimulationState> = {}

  sites.forEach(site => {
    const { emissions } = calculateSiteEmissions(site, assumptions)
    baselineTotal += emissions.total

    const gridFactor = assumptions.gridFactors[site.state] || 0.82
    const baselineKWh = site.measuredKWh || (site.benchmarkEUI || 0) * site.areaSquareFeet

    siteStates[site.id] = {
      baselineKWh,
      currentKWh: baselineKWh,
      solarKW: site.solarInstalledKW || 0,
      ppaPercent: 0,
      gridFactor,
      embodiedReductionPercent: 0,
    }
  })

  // Simulate year by year
  for (let year = startYear; year <= endYear; year++) {
    let yearTotal = 0
    let yearScope1 = 0
    let yearScope2 = 0
    let yearScope3 = 0
    let totalArea = 0
    let totalKWh = 0
    let totalRenewableKWh = 0

    // Apply interventions scheduled for this year
    const activeInterventions = scenario.interventions.filter(
      i => i.implementationYear === year
    )

    activeInterventions.forEach(intervention => {
      sites.forEach(site => {
        const state = siteStates[site.id]

        switch (intervention.category) {
          case 'efficiency':
            if (intervention.energySavingsPercent) {
              const savingsKWh = state.currentKWh * (intervention.energySavingsPercent / 100)
              state.currentKWh -= savingsKWh
              
              if (!interventionImpact[intervention.id]) {
                interventionImpact[intervention.id] = 0
              }
              interventionImpact[intervention.id] += (savingsKWh * state.gridFactor) / 1000
            }
            break

          case 'renewables':
            if (intervention.solarKWToInstall) {
              state.solarKW += intervention.solarKWToInstall
              
              const additionalGeneration = intervention.solarKWToInstall * 1200
              if (!interventionImpact[intervention.id]) {
                interventionImpact[intervention.id] = 0
              }
              interventionImpact[intervention.id] += (additionalGeneration * state.gridFactor) / 1000
            }

            if (intervention.ppaPercentOfLoad) {
              state.ppaPercent += intervention.ppaPercentOfLoad
              
              const ppaKWh = state.currentKWh * (intervention.ppaPercentOfLoad / 100)
              if (!interventionImpact[intervention.id]) {
                interventionImpact[intervention.id] = 0
              }
              interventionImpact[intervention.id] += (ppaKWh * state.gridFactor) / 1000
            }
            break

          case 'embodied':
            if (intervention.embodiedReductionPercent) {
              state.embodiedReductionPercent = intervention.embodiedReductionPercent
            }
            break
        }
      })
    })

    // Calculate emissions for this year
    sites.forEach(site => {
      const state = siteStates[site.id]
      totalArea += site.areaSquareFeet

      // Electricity after efficiency measures
      const netKWh = state.currentKWh
      totalKWh += netKWh

      // Solar generation
      const solarGeneration = Math.min(state.solarKW * 1200, netKWh)
      totalRenewableKWh += solarGeneration

      // PPA renewable procurement
      const ppaKWh = Math.min(netKWh * (state.ppaPercent / 100), netKWh - solarGeneration)
      totalRenewableKWh += ppaKWh

      // Grid electricity (after RE displacement)
      const gridKWh = netKWh - solarGeneration - ppaKWh
      const electricityEmissions = (gridKWh * state.gridFactor) / 1000 // tCO2e

      yearScope2 += electricityEmissions

      // Scope 1: Fuel emissions (simplified - assume constant)
      const { emissions: baselineEmissions } = calculateSiteEmissions(site, assumptions)
      yearScope1 += baselineEmissions.scope1
    })

    const totalEmissions = yearScope1 + yearScope2 + yearScope3
    yearTotal = totalEmissions

    yearlyEmissions[year] = {
      scope1: yearScope1,
      scope2LocationBased: yearScope2,
      scope2MarketBased: yearScope2,
      scope3: yearScope3,
      total: yearTotal,
      eui: totalArea > 0 ? totalKWh / totalArea : 0,
      renewablePercent: totalKWh > 0 ? (totalRenewableKWh / totalKWh) * 100 : 0,
      embodiedCarbonPerSqFt: 0,
    }
  }

  // Check SBTi compliance
  const targetTrajectory = calculateSBTiTrajectory(
    scenario.baselineYear,
    baselineTotal,
    scenario.targetYear,
    scenario.longTermTarget2040Percent
  )

  const scenarioTrajectory: Record<number, number> = {}
  for (const year in yearlyEmissions) {
    scenarioTrajectory[year] = yearlyEmissions[year].total
  }

  const sbtiCompliant = checkSBTiCompliance(scenarioTrajectory, targetTrajectory)

  return {
    yearlyEmissions,
    sbtiCompliant,
    interventionImpact,
  }
}

/**
 * Calculate financial metrics for interventions
 */
export function calculateInterventionFinancials(
  intervention: Intervention,
  discountRate: number = 0.08
): {
  npv: number
  paybackYears: number
  roi: number
} {
  const capex = intervention.capexINR || 0
  const annualSavings = (intervention.savingsAnnualINR || 0) - (intervention.opexAnnualINR || 0)
  const lifespan = intervention.lifespanYears || 10

  // Simple payback period
  const paybackYears = annualSavings > 0 ? capex / annualSavings : Infinity

  // NPV calculation
  let npv = -capex
  for (let year = 1; year <= lifespan; year++) {
    npv += annualSavings / Math.pow(1 + discountRate, year)
  }

  // ROI
  const totalSavings = annualSavings * lifespan
  const roi = capex > 0 ? ((totalSavings - capex) / capex) * 100 : 0

  return { npv, paybackYears, roi }
}

/**
 * Compare multiple scenarios
 */
export function compareScenarios(
  scenarios: Scenario[],
  sites: Site[],
  assumptions: BaselineAssumptions
): {
  scenarioId: string
  name: string
  totalEmissions2030: number
  totalEmissions2040: number
  reductionPercent2030: number
  reductionPercent2040: number
  sbtiCompliant: boolean
  totalCapex: number
  totalNPV: number
}[] {
  const baselineEmissions = scenarios[0]?.yearlyEmissions?.[scenarios[0].baselineYear]?.total || 0

  return scenarios.map(scenario => {
    const { yearlyEmissions, sbtiCompliant } = simulateScenario(scenario, sites, assumptions)

    const emissions2030 = yearlyEmissions[2030]?.total || 0
    const emissions2040 = yearlyEmissions[2040]?.total || 0

    const reduction2030 = baselineEmissions > 0 
      ? ((baselineEmissions - emissions2030) / baselineEmissions) * 100 
      : 0

    const reduction2040 = baselineEmissions > 0 
      ? ((baselineEmissions - emissions2040) / baselineEmissions) * 100 
      : 0

    let totalCapex = 0
    let totalNPV = 0

    scenario.interventions.forEach(intervention => {
      totalCapex += intervention.capexINR || 0
      const { npv } = calculateInterventionFinancials(intervention)
      totalNPV += npv
    })

    return {
      scenarioId: scenario.id,
      name: scenario.name,
      totalEmissions2030: emissions2030,
      totalEmissions2040: emissions2040,
      reductionPercent2030: reduction2030,
      reductionPercent2040: reduction2040,
      sbtiCompliant,
      totalCapex,
      totalNPV,
    }
  })
}

