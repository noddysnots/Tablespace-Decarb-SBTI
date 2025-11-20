'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Calculator, Download } from 'lucide-react'

interface PrioritizationItem {
  id: string
  name: string
  category: string
  impact: number
  feasibility: number
  capex: number
  annualSavings: number
  payback: number
  npv: number
}

export default function PrioritizationPage() {
  const [items, setItems] = useState<PrioritizationItem[]>([
    {
      id: '1',
      name: 'LED Lighting Retrofit',
      category: 'Efficiency',
      impact: 7,
      feasibility: 9,
      capex: 5000000,
      annualSavings: 1500000,
      payback: 3.3,
      npv: 7500000,
    },
    {
      id: '2',
      name: 'Rooftop Solar (500 kW)',
      category: 'Renewables',
      impact: 9,
      feasibility: 7,
      capex: 25000000,
      annualSavings: 4000000,
      payback: 6.25,
      npv: 15000000,
    },
    {
      id: '3',
      name: 'HVAC VFD Installation',
      category: 'Efficiency',
      impact: 8,
      feasibility: 8,
      capex: 8000000,
      annualSavings: 2000000,
      payback: 4.0,
      npv: 10000000,
    },
    {
      id: '4',
      name: 'Building Envelope Insulation',
      category: 'Efficiency',
      impact: 6,
      feasibility: 5,
      capex: 12000000,
      annualSavings: 1800000,
      payback: 6.7,
      npv: 6000000,
    },
    {
      id: '5',
      name: 'Smart BMS Upgrade',
      category: 'Efficiency',
      impact: 7,
      feasibility: 8,
      capex: 4000000,
      annualSavings: 1200000,
      payback: 3.3,
      npv: 5000000,
    },
  ])

  const [impactWeight, setImpactWeight] = useState(50)
  const [feasibilityWeight, setFeasibilityWeight] = useState(50)

  const calculatePriority = (item: PrioritizationItem) => {
    return (item.impact * impactWeight + item.feasibility * feasibilityWeight) / 100
  }

  const sortedItems = [...items].sort((a, b) => calculatePriority(b) - calculatePriority(a))

  const getQuadrant = (item: PrioritizationItem) => {
    if (item.impact >= 7 && item.feasibility >= 7) return 'Quick Wins'
    if (item.impact >= 7 && item.feasibility < 7) return 'Major Projects'
    if (item.impact < 7 && item.feasibility >= 7) return 'Fill-Ins'
    return 'Low Priority'
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Wins':
        return 'bg-success/10 text-success border-success'
      case 'Major Projects':
        return 'bg-warning/10 text-warning border-warning'
      case 'Fill-Ins':
        return 'bg-primary/10 text-primary border-primary'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
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
              <h1 className="text-3xl font-bold">Prioritization Matrix</h1>
              <p className="text-muted-foreground">
                Prioritize interventions by impact and feasibility
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                NPV Calculator
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Matrix
              </Button>
            </div>
          </div>

          {/* Weighting Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prioritization Criteria</CardTitle>
              <CardDescription>
                Adjust weights to customize prioritization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">
                    Impact Weight: {impactWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={impactWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setImpactWeight(val)
                      setFeasibilityWeight(100 - val)
                    }}
                    className="mt-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Feasibility Weight: {feasibilityWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={feasibilityWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setFeasibilityWeight(val)
                      setImpactWeight(100 - val)
                    }}
                    className="mt-2 w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Priority Matrix Visual */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Impact vs. Feasibility Matrix</CardTitle>
                  <CardDescription>
                    Interventions plotted by impact and feasibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[500px] border rounded-lg bg-muted/20">
                    {/* Quadrant Labels */}
                    <div className="absolute top-2 left-2 rounded bg-success/10 px-2 py-1 text-xs font-medium text-success">
                      Major Projects
                    </div>
                    <div className="absolute top-2 right-2 rounded bg-success px-2 py-1 text-xs font-medium text-white">
                      Quick Wins
                    </div>
                    <div className="absolute bottom-2 left-2 rounded bg-muted px-2 py-1 text-xs font-medium">
                      Low Priority
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Fill-Ins
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute top-0 left-1/2 h-full w-px bg-border" />
                    <div className="absolute left-0 top-1/2 h-px w-full bg-border" />

                    {/* Plot Points */}
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background font-bold text-xs cursor-pointer hover:scale-110 transition-transform"
                        style={{
                          left: `${(item.feasibility / 10) * 100}%`,
                          bottom: `${(item.impact / 10) * 100}%`,
                          borderColor: getQuadrantColor(getQuadrant(item)).includes('success')
                            ? 'rgb(16, 185, 129)'
                            : getQuadrantColor(getQuadrant(item)).includes('warning')
                            ? 'rgb(245, 158, 11)'
                            : 'rgb(59, 130, 246)',
                        }}
                        title={item.name}
                      >
                        {item.id}
                      </div>
                    ))}

                    {/* Axis Labels */}
                    <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                      Low Feasibility
                    </div>
                    <div className="absolute -bottom-6 right-0 text-xs text-muted-foreground">
                      High Feasibility
                    </div>
                    <div
                      className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground"
                      style={{ transformOrigin: 'center' }}
                    >
                      Impact
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Summary</CardTitle>
                  <CardDescription>Total investment metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total CAPEX</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(items.reduce((sum, i) => sum + i.capex, 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Savings</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(items.reduce((sum, i) => sum + i.annualSavings, 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total NPV</div>
                    <div className="text-2xl font-bold text-success">
                      {formatCurrency(items.reduce((sum, i) => sum + i.npv, 0))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Quadrant</CardTitle>
                  <CardDescription>Intervention distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Quick Wins</span>
                    <span className="font-medium">
                      {items.filter((i) => getQuadrant(i) === 'Quick Wins').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Major Projects</span>
                    <span className="font-medium">
                      {items.filter((i) => getQuadrant(i) === 'Major Projects').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fill-Ins</span>
                    <span className="font-medium">
                      {items.filter((i) => getQuadrant(i) === 'Fill-Ins').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low Priority</span>
                    <span className="font-medium">
                      {items.filter((i) => getQuadrant(i) === 'Low Priority').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Prioritized Interventions</CardTitle>
              <CardDescription>
                Sorted by weighted priority score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Rank</th>
                      <th className="text-left p-3">Intervention</th>
                      <th className="text-left p-3">Quadrant</th>
                      <th className="text-right p-3">Impact</th>
                      <th className="text-right p-3">Feasibility</th>
                      <th className="text-right p-3">CAPEX</th>
                      <th className="text-right p-3">Payback (yrs)</th>
                      <th className="text-right p-3">NPV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item, idx) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.category}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getQuadrantColor(
                              getQuadrant(item)
                            )}`}
                          >
                            {getQuadrant(item)}
                          </span>
                        </td>
                        <td className="p-3 text-right">{item.impact}/10</td>
                        <td className="p-3 text-right">{item.feasibility}/10</td>
                        <td className="p-3 text-right">
                          {formatCurrency(item.capex)}
                        </td>
                        <td className="p-3 text-right">{item.payback}</td>
                        <td className="p-3 text-right text-success font-medium">
                          {formatCurrency(item.npv)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

