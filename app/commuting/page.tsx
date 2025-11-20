'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { formatNumber } from '@/lib/utils'
import { Car, Train, Bus, Bike, TrendingDown, Calculator } from 'lucide-react'

const commuteEmissionFactors: Record<string, number> = {
  car: 0.171, // kgCO2e/person-km
  motorcycle: 0.103,
  bus: 0.089,
  metro: 0.041,
  bike: 0,
  walk: 0,
}

interface CommuteMode {
  mode: 'car' | 'motorcycle' | 'bus' | 'metro' | 'bike' | 'walk'
  count: number
  avgDistanceKm: number
  daysPerWeek: number
}

export default function CommutingPage() {
  const { sites } = useAppStore()
  const [selectedSite, setSelectedSite] = useState(sites[0]?.id || '')
  const [commuteModes, setCommuteModes] = useState<CommuteMode[]>([
    { mode: 'car', count: 0, avgDistanceKm: 0, daysPerWeek: 5 },
    { mode: 'motorcycle', count: 0, avgDistanceKm: 0, daysPerWeek: 5 },
    { mode: 'bus', count: 0, avgDistanceKm: 0, daysPerWeek: 5 },
    { mode: 'metro', count: 0, avgDistanceKm: 0, daysPerWeek: 5 },
    { mode: 'bike', count: 0, avgDistanceKm: 0, daysPerWeek: 5 },
    { mode: 'walk', count: 0, avgDistanceKm: 0, daysPerWeek: 5 },
  ])

  const updateCommuteMode = (mode: string, field: string, value: number) => {
    setCommuteModes(
      commuteModes.map((cm) => {
        if (cm.mode === mode) {
          return { ...cm, [field]: value }
        }
        return cm
      })
    )
  }

  const calculateEmissions = () => {
    const weeksPerYear = 50 // Accounting for holidays
    let totalEmissions = 0

    commuteModes.forEach((cm) => {
      const annualPersonKm = cm.count * cm.avgDistanceKm * 2 * cm.daysPerWeek * weeksPerYear
      const emissions = (annualPersonKm * commuteEmissionFactors[cm.mode]) / 1000 // tCO2e
      totalEmissions += emissions
    })

    return totalEmissions
  }

  const totalEmployees = commuteModes.reduce((sum, cm) => sum + cm.count, 0)
  const totalEmissions = calculateEmissions()
  const avgCommuteDistance =
    totalEmployees > 0
      ? commuteModes.reduce((sum, cm) => sum + cm.count * cm.avgDistanceKm, 0) / totalEmployees
      : 0

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'car':
        return <Car className="h-5 w-5" />
      case 'motorcycle':
        return <Car className="h-5 w-5" />
      case 'bus':
        return <Bus className="h-5 w-5" />
      case 'metro':
        return <Train className="h-5 w-5" />
      case 'bike':
        return <Bike className="h-5 w-5" />
      default:
        return <Bike className="h-5 w-5" />
    }
  }

  const getModeColor = (mode: string) => {
    if (mode === 'car') return 'text-danger'
    if (mode === 'motorcycle') return 'text-warning'
    if (mode === 'bus' || mode === 'metro') return 'text-success'
    return 'text-primary'
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tenant Engagement & Commuting</h1>
              <p className="text-muted-foreground">
                Calculate and optimize commute emissions (Scope 3)
              </p>
            </div>
            <Button>
              <Calculator className="mr-2 h-4 w-4" />
              Recalculate
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Commute Data Entry */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Selection</CardTitle>
                  <CardDescription>Select site to analyze commuting patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} - {site.city}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commute Mode Distribution</CardTitle>
                  <CardDescription>
                    Enter employee counts and average distances by transport mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {commuteModes.map((cm) => (
                    <Card key={cm.mode}>
                      <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="flex items-center gap-3">
                            <div className={getModeColor(cm.mode)}>
                              {getModeIcon(cm.mode)}
                            </div>
                            <div>
                              <div className="font-medium capitalize">{cm.mode}</div>
                              <div className="text-xs text-muted-foreground">
                                {commuteEmissionFactors[cm.mode]} kgCO₂e/km
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Employees</label>
                            <Input
                              type="number"
                              value={cm.count}
                              onChange={(e) =>
                                updateCommuteMode(cm.mode, 'count', parseInt(e.target.value) || 0)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Avg. Distance (km)</label>
                            <Input
                              type="number"
                              value={cm.avgDistanceKm}
                              onChange={(e) =>
                                updateCommuteMode(cm.mode, 'avgDistanceKm', parseFloat(e.target.value) || 0)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Days/Week</label>
                            <Input
                              type="number"
                              value={cm.daysPerWeek}
                              onChange={(e) =>
                                updateCommuteMode(cm.mode, 'daysPerWeek', parseInt(e.target.value) || 0)
                              }
                              className="mt-2"
                              min="0"
                              max="7"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Optimization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Opportunities</CardTitle>
                  <CardDescription>Reduce commute emissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <div className="font-medium">Remote Work Policy</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Implement 2 days/week remote work to reduce emissions by ~40%
                        </p>
                        <Badge variant="success" className="mt-2">
                          Potential saving: {formatNumber(totalEmissions * 0.4, 2)} tCO₂e/year
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Bus className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <div className="font-medium">Shuttle Service</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Provide employee shuttle from major transit hubs
                        </p>
                        <Badge variant="success" className="mt-2">
                          Potential saving: {formatNumber(totalEmissions * 0.3, 2)} tCO₂e/year
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Bike className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <div className="font-medium">Bike Program</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Install bike parking and shower facilities to encourage cycling
                        </p>
                        <Badge variant="success" className="mt-2">
                          Potential saving: {formatNumber(totalEmissions * 0.15, 2)} tCO₂e/year
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Employees</CardTitle>
                  <CardDescription>Commuting to site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalEmployees}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Across {commuteModes.filter((cm) => cm.count > 0).length} transport modes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Annual Emissions</CardTitle>
                  <CardDescription>Scope 3 (Commuting)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {formatNumber(totalEmissions, 2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">tCO₂e/year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Commute Distance</CardTitle>
                  <CardDescription>Per employee</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {formatNumber(avgCommuteDistance, 1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">km (one-way)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mode Split</CardTitle>
                  <CardDescription>Transport distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {commuteModes
                      .filter((cm) => cm.count > 0)
                      .map((cm) => (
                        <div key={cm.mode} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={getModeColor(cm.mode)}>
                              {getModeIcon(cm.mode)}
                            </div>
                            <span className="text-sm capitalize">{cm.mode}</span>
                          </div>
                          <span className="font-medium">
                            {totalEmployees > 0
                              ? Math.round((cm.count / totalEmployees) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Quick wins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>• Incentivize public transport use</p>
                    <p>• Implement flexible work hours</p>
                    <p>• Partner with carpooling apps</p>
                    <p>• Provide EV charging stations</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

