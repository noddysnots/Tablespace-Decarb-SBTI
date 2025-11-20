// PPTX generation for investor-ready presentations

import PptxGenJS from 'pptxgenjs'
import { Scenario, Site, Emissions } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

export async function generateInvestorPPTX(
  scenarios: Scenario[],
  sites: Site[],
  portfolioEmissions: Emissions
): Promise<Blob> {
  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'Table Space Decarb Strategy'
  pptx.company = 'Table Space'
  pptx.title = 'Decarbonization Strategy - Investor Presentation'

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide()
  slide1.background = { color: '1E40AF' }
  slide1.addText('Decarbonization Strategy', {
    x: 0.5,
    y: 2.0,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    w: 9,
  })
  slide1.addText('SBTi-Aligned Net-Zero Roadmap', {
    x: 0.5,
    y: 3.0,
    fontSize: 28,
    color: 'FFFFFF',
    align: 'center',
    w: 9,
  })
  slide1.addText(new Date().toLocaleDateString(), {
    x: 0.5,
    y: 4.5,
    fontSize: 16,
    color: 'FFFFFF',
    align: 'center',
    w: 9,
  })

  // Slide 2: Executive Summary
  const slide2 = pptx.addSlide()
  slide2.addText('Executive Summary', {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: '1E40AF',
  })
  
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Sites', `${sites.length} locations`],
    ['Total Area', `${formatNumber(sites.reduce((sum, s) => sum + s.areaSquareFeet, 0) / 1000, 0)}K sqft`],
    ['Baseline Emissions (FY2025)', `${formatNumber(portfolioEmissions.total)} tCO₂e`],
    ['Energy Use Intensity', `${formatNumber(portfolioEmissions.eui)} kWh/sqft/yr`],
    ['Renewable Energy', `${formatNumber(portfolioEmissions.renewablePercent)}%`],
    ['2030 Target', '42% reduction (SBTi)'],
    ['2040 Target', '90% reduction (Net-Zero)'],
  ]

  slide2.addTable(summaryData as any, {
    x: 0.5,
    y: 1.5,
    w: 9,
    fontSize: 14,
    border: { type: 'solid', pt: 1, color: 'CCCCCC' },
    fill: { color: 'F3F4F6' },
    color: '000000',
  })

  // Slide 3: Portfolio Overview
  const slide3 = pptx.addSlide()
  slide3.addText('Portfolio Overview', {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: '1E40AF',
  })

  slide3.addText('Geographic Distribution', {
    x: 0.5,
    y: 1.5,
    fontSize: 20,
    bold: true,
  })

  // Group sites by state
  const sitesByState: Record<string, number> = {}
  sites.forEach(site => {
    sitesByState[site.state] = (sitesByState[site.state] || 0) + 1
  })

  const stateData = [['State', 'Sites']]
  Object.entries(sitesByState).forEach(([state, count]) => {
    stateData.push([state, count.toString()])
  })

  slide3.addTable(stateData as any, {
    x: 0.5,
    y: 2.2,
    w: 4,
    fontSize: 12,
    border: { type: 'solid', pt: 1, color: 'CCCCCC' },
  })

  // Slide 4: Emissions Breakdown
  const slide4 = pptx.addSlide()
  slide4.addText('Emissions Breakdown (FY2025)', {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: '1E40AF',
  })

  const emissionsData = [
    ['Scope', 'Emissions (tCO₂e)', 'Percentage'],
    ['Scope 1', formatNumber(portfolioEmissions.scope1), `${formatNumber((portfolioEmissions.scope1 / portfolioEmissions.total) * 100)}%`],
    ['Scope 2', formatNumber(portfolioEmissions.scope2LocationBased), `${formatNumber((portfolioEmissions.scope2LocationBased / portfolioEmissions.total) * 100)}%`],
    ['Scope 3', formatNumber(portfolioEmissions.scope3), `${formatNumber((portfolioEmissions.scope3 / portfolioEmissions.total) * 100)}%`],
    ['Total', formatNumber(portfolioEmissions.total), '100%'],
  ]

  slide4.addTable(emissionsData as any, {
    x: 1,
    y: 1.5,
    w: 8,
    fontSize: 16,
    border: { type: 'solid', pt: 1, color: 'CCCCCC' },
    fill: { color: 'F3F4F6' },
  })

  // Slide 5: Decarbonization Scenarios
  const slide5 = pptx.addSlide()
  slide5.addText('Decarbonization Scenarios', {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: '1E40AF',
  })

  const scenarioData = [['Scenario', 'Interventions', '2030 Target', '2040 Target']]
  scenarios.forEach(scenario => {
    scenarioData.push([
      scenario.name,
      `${scenario.interventions.length} measures`,
      `${scenario.nearTermTarget2030Percent}% reduction`,
      `${scenario.longTermTarget2040Percent}% reduction`,
    ])
  })

  slide5.addTable(scenarioData as any, {
    x: 0.5,
    y: 1.5,
    w: 9,
    fontSize: 14,
    border: { type: 'solid', pt: 1, color: 'CCCCCC' },
  })

  // Slide 6: Investment Requirements
  const slide6 = pptx.addSlide()
  slide6.addText('Investment Requirements', {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: '1E40AF',
  })

  slide6.addText(
    'Estimated capital investment needed to achieve net-zero targets',
    {
      x: 0.5,
      y: 1.3,
      fontSize: 16,
      color: '666666',
    }
  )

  const investmentData = [['Category', 'Estimated CAPEX (INR Cr)']]
  investmentData.push(['Energy Efficiency', '5-10'])
  investmentData.push(['Solar & Renewables', '15-25'])
  investmentData.push(['HVAC Upgrades', '8-12'])
  investmentData.push(['Building Retrofits', '10-15'])
  investmentData.push(['Total', '38-62'])

  slide6.addTable(investmentData as any, {
    x: 2,
    y: 2.5,
    w: 6,
    fontSize: 16,
    border: { type: 'solid', pt: 1, color: 'CCCCCC' },
    fill: { color: 'F3F4F6' },
  })

  // Generate and return blob
  return await pptx.write({ outputType: 'blob' }) as Blob
}

