// Excel export functionality

import * as XLSX from 'xlsx'
import { Site, Scenario, Supplier, Emissions } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

export function generatePortfolioExcel(
  sites: Site[],
  scenarios: Scenario[],
  suppliers: Supplier[],
  portfolioEmissions: Emissions
): Blob {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Portfolio Summary
  const summaryData = [
    ['Table Space - Decarbonization Strategy'],
    ['Generated: ' + new Date().toLocaleDateString()],
    [''],
    ['Portfolio Summary'],
    ['Total Sites', sites.length],
    ['Total Area (sqft)', sites.reduce((sum, s) => sum + s.areaSquareFeet, 0)],
    ['Total Occupancy', sites.reduce((sum, s) => sum + s.occupancy, 0)],
    ['Total Emissions (tCO₂e)', formatNumber(portfolioEmissions.total)],
    ['Scope 1 (tCO₂e)', formatNumber(portfolioEmissions.scope1)],
    ['Scope 2 (tCO₂e)', formatNumber(portfolioEmissions.scope2LocationBased)],
    ['Scope 3 (tCO₂e)', formatNumber(portfolioEmissions.scope3)],
    ['EUI (kWh/sqft/yr)', formatNumber(portfolioEmissions.eui)],
    ['Renewable Energy %', formatNumber(portfolioEmissions.renewablePercent)],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Sheet 2: Sites
  const sitesData = [
    [
      'Site ID',
      'Name',
      'City',
      'State',
      'Area (sqft)',
      'Occupancy',
      'Annual kWh',
      'EUI (kWh/sqft)',
      'Solar (kW)',
      'Tenant Metering',
    ],
  ]

  sites.forEach(site => {
    sitesData.push([
      site.id,
      site.name,
      site.city,
      site.state,
      site.areaSquareFeet.toString(),
      site.occupancy.toString(),
      site.measuredKWh?.toString() || '',
      site.benchmarkEUI?.toString() || '',
      site.solarInstalledKW?.toString() || '',
      site.hasTenantMetering ? 'Yes' : 'No',
    ])
  })

  const sitesSheet = XLSX.utils.aoa_to_sheet(sitesData)
  XLSX.utils.book_append_sheet(workbook, sitesSheet, 'Sites')

  // Sheet 3: Scenarios
  const scenariosData = [
    [
      'Scenario ID',
      'Name',
      'Description',
      'Baseline Year',
      'Target Year',
      '2030 Target %',
      '2040 Target %',
      'Interventions',
      'SBTi Compliant',
    ],
  ]

  scenarios.forEach(scenario => {
    scenariosData.push([
      scenario.id,
      scenario.name,
      scenario.description,
      scenario.baselineYear.toString(),
      scenario.targetYear.toString(),
      scenario.nearTermTarget2030Percent.toString(),
      scenario.longTermTarget2040Percent.toString(),
      scenario.interventions.length.toString(),
      scenario.sbtiCompliant ? 'Yes' : 'No',
    ])
  })

  const scenariosSheet = XLSX.utils.aoa_to_sheet(scenariosData)
  XLSX.utils.book_append_sheet(workbook, scenariosSheet, 'Scenarios')

  // Sheet 4: Suppliers
  const suppliersData = [
    [
      'Supplier ID',
      'Name',
      'Category',
      'Score',
      'Status',
      'Has EPD',
      'Has GHG Inventory',
      'Net-Zero Commitment',
      'Circularity Program',
    ],
  ]

  suppliers.forEach(supplier => {
    suppliersData.push([
      supplier.id,
      supplier.name,
      supplier.category,
      supplier.score.toString(),
      supplier.status,
      supplier.criteria.hasEPD ? 'Yes' : 'No',
      supplier.criteria.hasGHGInventory ? 'Yes' : 'No',
      supplier.criteria.hasNetZeroCommitment ? 'Yes' : 'No',
      supplier.criteria.hasCircularityProgram ? 'Yes' : 'No',
    ])
  })

  const suppliersSheet = XLSX.utils.aoa_to_sheet(suppliersData)
  XLSX.utils.book_append_sheet(workbook, suppliersSheet, 'Suppliers')

  // Sheet 5: Emissions Timeline
  if (scenarios.length > 0 && scenarios[0].yearlyEmissions) {
    const timelineData = [['Year']]
    
    // Add scenario names as column headers
    scenarios.forEach(scenario => {
      timelineData[0].push(scenario.name + ' (tCO₂e)')
    })

    // Add data for each year
    const startYear = scenarios[0].baselineYear
    const endYear = scenarios[0].targetYear

    for (let year = startYear; year <= endYear; year++) {
      const row: any[] = [year.toString()]
      scenarios.forEach(scenario => {
        const emissions = scenario.yearlyEmissions?.[year]?.total
        row.push(emissions ? emissions.toString() : '')
      })
      timelineData.push(row)
    }

    const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData)
    XLSX.utils.book_append_sheet(workbook, timelineSheet, 'Emissions Timeline')
  }

  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

