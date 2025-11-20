'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { Scenario, Intervention, TimeSeriesDataPoint } from '@/lib/types'
import { generateId, formatNumber } from '@/lib/utils'
import { simulateScenario } from '@/lib/calculations/scenarios'
import { calculateSBTiTrajectory } from '@/lib/calculations/emissions'
import { EmissionsChart } from '@/components/dashboard/emissions-chart'
import {
  Plus,
  Play,
  Save,
  Copy,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Lightbulb,
  TrendingDown,
  Zap,
} from 'lucide-react'

export default function SimulatorPage() {
  const { sites, scenarios, addScenario, assumptions, getPortfolioEmissions } = useAppStore()
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(true)

  const { totalEmissions } = getPortfolioEmissions()
  const baselineEmissions = totalEmissions.total

  // Pre-configured scenario templates
  const scenarioTemplates = {
    moderate: {
      name: 'Moderate (20% Reduction)',
      description: 'Conservative approach with proven technologies',
      targetReduction: 20,
      interventions: [
        {
          id: generateId(),
          name: 'LED Lighting Retrofit',
          category: 'efficiency' as const,
          description: 'Replace all conventional lighting with LED',
          energySavingsPercent: 8,
          implementationYear: 2026,
          lifespanYears: 10,
          capexINR: 5000000,
          savingsAnnualINR: 1500000,
        },
        {
          id: generateId(),
          name: 'BMS Optimization',
          category: 'efficiency' as const,
          description: 'Smart building management system',
          energySavingsPercent: 7,
          implementationYear: 2027,
          lifespanYears: 10,
          capexINR: 4000000,
          savingsAnnualINR: 1200000,
        },
        {
          id: generateId(),
          name: 'Solar Rooftop (Phase 1)',
          category: 'renewables' as const,
          description: 'Install solar panels on 50% of roof area',
          solarKWToInstall: 150,
          implementationYear: 2028,
          lifespanYears: 25,
          capexINR: 7500000,
          savingsAnnualINR: 1800000,
        },
      ],
    },
    aggressive: {
      name: 'Aggressive (40% Reduction)',
      description: 'Accelerated decarbonization with multiple interventions',
      targetReduction: 40,
      interventions: [
        {
          id: generateId(),
          name: 'Comprehensive LED Retrofit',
          category: 'efficiency' as const,
          description: 'LED + smart controls',
          energySavingsPercent: 10,
          implementationYear: 2026,
          lifespanYears: 10,
          capexINR: 7000000,
          savingsAnnualINR: 2000000,
        },
        {
          id: generateId(),
          name: 'HVAC Upgrade with VFD',
          category: 'efficiency' as const,
          description: 'Variable frequency drives on all HVAC',
          energySavingsPercent: 12,
          implementationYear: 2026,
          lifespanYears: 15,
          capexINR: 10000000,
          savingsAnnualINR: 2500000,
        },
        {
          id: generateId(),
          name: 'Solar Rooftop (Full)',
          category: 'renewables' as const,
          description: 'Maximum solar installation',
          solarKWToInstall: 300,
          implementationYear: 2027,
          lifespanYears: 25,
          capexINR: 15000000,
          savingsAnnualINR: 3600000,
        },
        {
          id: generateId(),
          name: 'Green Power Purchase',
          category: 'renewables' as const,
          description: 'PPA for 30% of remaining load',
          ppaPercentOfLoad: 30,
          implementationYear: 2028,
          lifespanYears: 10,
          capexINR: 2000000,
          savingsAnnualINR: 800000,
        },
        {
          id: generateId(),
          name: 'Building Envelope Upgrade',
          category: 'efficiency' as const,
          description: 'Insulation and glazing improvements',
          energySavingsPercent: 8,
          implementationYear: 2029,
          lifespanYears: 20,
          capexINR: 12000000,
          savingsAnnualINR: 2000000,
        },
      ],
    },
  }

  // Initialize with a new scenario
  useEffect(() => {
    if (!currentScenario) {
      const newScenario: Scenario = {
        id: generateId(),
        name: 'Custom Scenario',
        description: 'Define interventions to achieve SBTi targets',
        baselineYear: 2025,
        targetYear: 2040,
        nearTermTarget2030Percent: 42,
        longTermTarget2040Percent: 90,
        interventions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setCurrentScenario(newScenario)
    }
  }, [])

  const addIntervention = () => {
    const newIntervention: Intervention = {
      id: generateId(),
      name: 'New Intervention',
      category: 'efficiency',
      description: '',
      energySavingsPercent: 0,
      implementationYear: 2025,
      lifespanYears: 10,
    }
    setInterventions([...interventions, newIntervention])
  }

  const updateIntervention = (id: string, updates: Partial<Intervention>) => {
    setInterventions(
      interventions.map((i) => (i.id === id ? { ...i, ...updates } : i))
    )
  }

  const deleteIntervention = (id: string) => {
    setInterventions(interventions.filter((i) => i.id !== id))
  }

  const loadScenarioTemplate = (templateKey: 'moderate' | 'aggressive') => {
    const template = scenarioTemplates[templateKey]
    setInterventions(template.interventions)
    setCurrentScenario({
      ...currentScenario!,
      name: template.name,
      description: template.description,
    })
    setShowRecommendations(false)
  }

  const runSimulation = () => {
    if (!currentScenario || sites.length === 0) {
      alert('Please ensure sites data is loaded')
      return
    }

    setIsSimulating(true)

    // Simulate with a small delay for UX
    setTimeout(() => {
      try {
        const scenarioToSimulate = {
          ...currentScenario,
          interventions,
        }

        const results = simulateScenario(scenarioToSimulate, sites, assumptions)
        setSimulationResults(results)

        // Generate chart data
        const targetTrajectory = calculateSBTiTrajectory(
          2025,
          baselineEmissions,
          2040,
          90
        )

        const data: TimeSeriesDataPoint[] = []
        for (let year = 2025; year <= 2040; year++) {
          data.push({
            year,
            emissions: results.yearlyEmissions[year]?.total || 0,
            target: targetTrajectory[year],
            scenario: currentScenario.name,
          })
        }

        setChartData(data)
        setShowRecommendations(false)
      } catch (error) {
        console.error('Simulation error:', error)
        alert('Error running simulation. Please check your interventions.')
      } finally {
        setIsSimulating(false)
      }
    }, 500)
  }

  const saveScenario = () => {
    if (!currentScenario) return

    const scenarioToSave = {
      ...currentScenario,
      interventions,
      yearlyEmissions: simulationResults?.yearlyEmissions,
      sbtiCompliant: simulationResults?.sbtiCompliant,
    }

    addScenario(scenarioToSave)
    alert('Scenario saved successfully!')
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
              <h1 className="text-3xl font-bold">SBTi Target Simulator</h1>
              <p className="text-muted-foreground">
                Model interventions and simulate decarbonization pathways
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveScenario}>
                <Save className="mr-2 h-4 w-4" />
                Save Scenario
              </Button>
              <Button onClick={runSimulation} disabled={isSimulating}>
                {isSimulating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Start Templates */}
          {showRecommendations && interventions.length === 0 && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle>Quick Start: Load a Pre-configured Scenario</CardTitle>
                </div>
                <CardDescription>
                  Choose a template to see how different reduction targets are achieved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                        onClick={() => loadScenarioTemplate('moderate')}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">Moderate Scenario</h3>
                          <Badge variant="secondary" className="mt-1">20% Reduction by 2030</Badge>
                        </div>
                        <TrendingDown className="h-8 w-8 text-success" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Conservative approach with proven, low-risk technologies
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>3 interventions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>₹1.65 Cr total investment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>3-4 year payback</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Load Moderate Scenario
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                        onClick={() => loadScenarioTemplate('aggressive')}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">Aggressive Scenario</h3>
                          <Badge variant="default" className="mt-1">40% Reduction by 2030</Badge>
                        </div>
                        <Zap className="h-8 w-8 text-warning" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Accelerated path with comprehensive interventions
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>5 interventions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>₹4.6 Cr total investment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>4-5 year payback</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        Load Aggressive Scenario
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium">💡 Pro Tip:</p>
                  <p className="text-muted-foreground mt-1">
                    Start with a template and customize interventions, or build your own scenario from scratch by clicking "Add Intervention" below.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenario Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scenario Configuration</CardTitle>
              <CardDescription>Define baseline and target parameters</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Scenario Name</label>
                <Input
                  value={currentScenario?.name || ''}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario!,
                      name: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={currentScenario?.description || ''}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario!,
                      description: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Baseline Year
                </label>
                <Input
                  type="number"
                  value={currentScenario?.baselineYear || 2025}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario!,
                      baselineYear: parseInt(e.target.value),
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Target Year (Net-Zero)
                </label>
                <Input
                  type="number"
                  value={currentScenario?.targetYear || 2040}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario!,
                      targetYear: parseInt(e.target.value),
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  2030 Near-term Target (% reduction)
                </label>
                <Input
                  type="number"
                  value={currentScenario?.nearTermTarget2030Percent || 42}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario!,
                      nearTermTarget2030Percent: parseFloat(e.target.value),
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  2040 Long-term Target (% reduction)
                </label>
                <Input
                  type="number"
                  value={currentScenario?.longTermTarget2040Percent || 90}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario!,
                      longTermTarget2040Percent: parseFloat(e.target.value),
                    })
                  }
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Interventions Builder */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Interventions
                        {interventions.length > 0 && (
                          <Badge variant="secondary">{interventions.length} active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Add and configure decarbonization measures
                      </CardDescription>
                    </div>
                    <Button onClick={addIntervention}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Intervention
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interventions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No interventions added yet</p>
                      <p className="text-sm mt-1">Click "Add Intervention" or load a template above</p>
                    </div>
                  ) : (
                    interventions.map((intervention) => (
                      <Card key={intervention.id}>
                        <CardContent className="pt-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Name</label>
                              <Input
                                value={intervention.name}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Category</label>
                              <select
                                value={intervention.category}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, {
                                    category: e.target.value as any,
                                  })
                                }
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="efficiency">Energy Efficiency</option>
                                <option value="renewables">Renewables</option>
                                <option value="fuel-switch">Fuel Switching</option>
                                <option value="embodied">Embodied Carbon</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Energy Savings (%)
                              </label>
                              <Input
                                type="number"
                                value={intervention.energySavingsPercent || 0}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, {
                                    energySavingsPercent: parseFloat(e.target.value),
                                  })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Implementation Year
                              </label>
                              <Input
                                type="number"
                                value={intervention.implementationYear}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, {
                                    implementationYear: parseInt(e.target.value),
                                  })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Solar Capacity (kW)
                              </label>
                              <Input
                                type="number"
                                value={intervention.solarKWToInstall || 0}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, {
                                    solarKWToInstall: parseFloat(e.target.value),
                                  })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                CAPEX (INR)
                              </label>
                              <Input
                                type="number"
                                value={intervention.capexINR || 0}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, {
                                    capexINR: parseFloat(e.target.value),
                                  })
                                }
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteIntervention(intervention.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Results Chart */}
              {simulationResults && <EmissionsChart data={chartData} />}
            </div>

            {/* Results Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Baseline</CardTitle>
                  <CardDescription>FY2025 emissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatNumber(baselineEmissions)} tCO₂e
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {sites.length} sites across India
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interventions Summary</CardTitle>
                  <CardDescription>Current scenario configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Interventions</span>
                      <span className="font-bold text-2xl">{interventions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total CAPEX</span>
                      <span className="font-medium">
                        ₹{formatNumber(interventions.reduce((sum, i) => sum + (i.capexINR || 0), 0) / 10000000, 2)} Cr
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Annual Savings</span>
                      <span className="font-medium text-success">
                        ₹{formatNumber(interventions.reduce((sum, i) => sum + (i.savingsAnnualINR || 0), 0) / 10000000, 2)} Cr/yr
                      </span>
                    </div>
                  </div>
                  {interventions.length > 0 && !simulationResults && (
                    <Button className="w-full mt-4" onClick={runSimulation}>
                      <Play className="mr-2 h-4 w-4" />
                      Run Simulation Now
                    </Button>
                  )}
                </CardContent>
              </Card>

              {simulationResults && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>SBTi Compliance</CardTitle>
                      <CardDescription>Scenario assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {simulationResults.sbtiCompliant ? (
                          <>
                            <CheckCircle className="h-8 w-8 text-success" />
                            <div>
                              <div className="font-medium text-success">Compliant ✓</div>
                              <div className="text-sm text-muted-foreground">
                                Meets 1.5°C pathway
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-8 w-8 text-danger" />
                            <div>
                              <div className="font-medium text-danger">
                                Not Compliant
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Need {Math.max(0, 5 - interventions.length)} more interventions
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {!simulationResults.sbtiCompliant && (
                        <div className="mt-4 rounded-lg bg-warning/10 p-3 text-sm">
                          <p className="font-medium text-warning">Recommendations:</p>
                          <ul className="mt-2 space-y-1 text-muted-foreground">
                            <li>• Add more solar capacity (target: 300+ kW)</li>
                            <li>• Increase energy efficiency measures</li>
                            <li>• Consider green power purchase agreements</li>
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>2030 Emissions</CardTitle>
                      <CardDescription>Near-term target</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(
                          simulationResults.yearlyEmissions[2030]?.total || 0
                        )}{' '}
                        <span className="text-lg text-muted-foreground">tCO₂e</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          {formatNumber(
                            ((baselineEmissions -
                              simulationResults.yearlyEmissions[2030]?.total) /
                              baselineEmissions) *
                              100
                          )}
                          % reduction
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-success transition-all"
                          style={{
                            width: `${Math.min(
                              ((baselineEmissions - simulationResults.yearlyEmissions[2030]?.total) / baselineEmissions) * 100 / 42 * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Target: 42% by 2030
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>2040 Emissions</CardTitle>
                      <CardDescription>Net-zero target</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(
                          simulationResults.yearlyEmissions[2040]?.total || 0
                        )}{' '}
                        <span className="text-lg text-muted-foreground">tCO₂e</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          {formatNumber(
                            ((baselineEmissions -
                              simulationResults.yearlyEmissions[2040]?.total) /
                              baselineEmissions) *
                              100
                          )}
                          % reduction
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              ((baselineEmissions - simulationResults.yearlyEmissions[2040]?.total) / baselineEmissions) * 100 / 90 * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Target: 90% by 2040 (Net-Zero)
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

