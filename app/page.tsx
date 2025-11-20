'use client'

import { useEffect, useState } from 'react'
import { KPITile } from '@/components/dashboard/kpi-tile'
import { EmissionsChart } from '@/components/dashboard/emissions-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useAppStore } from '@/lib/store'
import { generateSeedData } from '@/lib/data/ingest'
import { calculateSBTiTrajectory } from '@/lib/calculations/emissions'
import { formatNumber, formatPercent } from '@/lib/utils'
import {
  Zap,
  Factory,
  Leaf,
  Building,
  Download,
  Plus,
  TrendingDown,
} from 'lucide-react'
import { TimeSeriesDataPoint, Scenario } from '@/lib/types'

export default function DashboardPage() {
  const {
    sites,
    setSites,
    suppliers,
    setSuppliers,
    assumptions,
    setAssumptions,
    scenarios,
    setScenarios,
    currentScenario,
    getPortfolioEmissions,
  } = useAppStore()

  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize seed data
  useEffect(() => {
    const initData = async () => {
      const seedData = await generateSeedData()
      setSites(seedData.sites)
      setSuppliers(seedData.suppliers)
      setAssumptions(seedData.assumptions)

      // Create a baseline scenario
      const baselineScenario: Scenario = {
        id: 'baseline',
        name: 'Baseline (FY2025)',
        description: 'Current state baseline',
        baselineYear: 2025,
        targetYear: 2040,
        nearTermTarget2030Percent: 42,
        longTermTarget2040Percent: 90,
        interventions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setScenarios([baselineScenario])
      setLoading(false)
    }

    if (sites.length === 0) {
      initData()
    } else {
      setLoading(false)
    }
  }, [])

  // Calculate portfolio emissions and chart data
  useEffect(() => {
    if (sites.length > 0) {
      const { totalEmissions } = getPortfolioEmissions()

      // Generate trajectory data
      const baselineEmissions = totalEmissions.total
      const targetTrajectory = calculateSBTiTrajectory(2025, baselineEmissions, 2040, 90)

      const data: TimeSeriesDataPoint[] = []
      for (let year = 2025; year <= 2040; year++) {
        data.push({
          year,
          emissions: year === 2025 ? baselineEmissions : targetTrajectory[year],
          target: targetTrajectory[year],
          scenario: 'Baseline',
        })
      }

      setChartData(data)
    }
  }, [sites, assumptions])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  const { totalEmissions } = getPortfolioEmissions()
  const totalArea = sites.reduce((sum, site) => sum + site.areaSquareFeet, 0)
  const suppliersOnboarded = suppliers.filter(s => s.status === 'approved').length

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Overview of your decarbonization portfolio
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Scenario
              </Button>
            </div>
          </div>

          {/* Scenario Selector */}
          <Card className="mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Current Scenario:</span>
                <Badge variant="secondary" className="text-sm">
                  {currentScenario?.name || 'Baseline (FY2025)'}
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                Switch Scenario
              </Button>
            </CardContent>
          </Card>

          {/* KPI Tiles */}
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPITile
              title="Total Emissions (Scope 1+2)"
              value={formatNumber(totalEmissions.scope1 + totalEmissions.scope2LocationBased)}
              unit="tCO₂e"
              icon={<Factory className="h-6 w-6" />}
              colorScheme="default"
            />
            <KPITile
              title="Energy Use Intensity"
              value={formatNumber(totalEmissions.eui)}
              unit="kWh/sqft/yr"
              icon={<Zap className="h-6 w-6" />}
              colorScheme="warning"
            />
            <KPITile
              title="Renewable Energy"
              value={formatNumber(totalEmissions.renewablePercent)}
              unit="%"
              trend="up"
              change={totalEmissions.renewablePercent}
              icon={<Leaf className="h-6 w-6" />}
              colorScheme="success"
            />
            <KPITile
              title="Suppliers Onboarded"
              value={suppliersOnboarded}
              unit={`of ${suppliers.length}`}
              icon={<Building className="h-6 w-6" />}
              colorScheme="default"
            />
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EmissionsChart data={chartData} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Site
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Run Scenario
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building className="mr-2 h-4 w-4" />
                  Onboard Supplier
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Generate PPT
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
                <CardDescription>{sites.length} managed workspace sites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Area</span>
                    <span className="font-medium">{formatNumber(totalArea, 0)} sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scope 1 Emissions</span>
                    <span className="font-medium">{formatNumber(totalEmissions.scope1)} tCO₂e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scope 2 Emissions</span>
                    <span className="font-medium">{formatNumber(totalEmissions.scope2LocationBased)} tCO₂e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scope 3 Emissions</span>
                    <span className="font-medium">{formatNumber(totalEmissions.scope3)} tCO₂e</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total Emissions</span>
                      <span>{formatNumber(totalEmissions.total)} tCO₂e</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SBTi Compliance Status</CardTitle>
                <CardDescription>Progress toward net-zero targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">2030 Near-term Target</span>
                      <span className="font-medium">42% reduction</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">2040 Net-zero Target</span>
                      <span className="font-medium">90% reduction</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-success"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-warning/10 p-4 text-sm">
                    <p className="font-medium text-warning">Action Required</p>
                    <p className="mt-1 text-muted-foreground">
                      Define interventions and run scenarios to achieve SBTi targets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

