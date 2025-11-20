'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { generateId, formatNumber } from '@/lib/utils'
import { Plus, AlertTriangle, CheckCircle, Calculator, Lightbulb, Building, Zap } from 'lucide-react'

interface Material {
  id: string
  category: string
  quantity: number
  unit: string
  embodiedFactor: number
  reusePercent: number
  totalEmissions: number
}

export default function EmbodiedCarbonPage() {
  const { sites } = useAppStore()
  const [selectedSite, setSelectedSite] = useState(sites[0]?.id || '')
  const [projectName, setProjectName] = useState('New Fit-out Project')
  const [projectArea, setProjectArea] = useState(10000)
  const [budgetPerSqFt, setBudgetPerSqFt] = useState(15) // kgCO2e/sqft budget
  const [materials, setMaterials] = useState<Material[]>([])
  const [transportDistance, setTransportDistance] = useState(50)
  const [showQuickStart, setShowQuickStart] = useState(true)

  const materialCategories = [
    { name: 'Concrete', factor: 0.15, unit: 'kg', typical: 50000 },
    { name: 'Steel', factor: 2.5, unit: 'kg', typical: 15000 },
    { name: 'Glass', factor: 0.85, unit: 'kg', typical: 8000 },
    { name: 'Aluminum', factor: 8.0, unit: 'kg', typical: 2000 },
    { name: 'Timber', factor: -0.5, unit: 'kg', typical: 10000 },
    { name: 'Drywall', factor: 0.3, unit: 'kg', typical: 12000 },
    { name: 'Insulation', factor: 1.2, unit: 'kg', typical: 3000 },
    { name: 'Flooring', factor: 0.4, unit: 'm²', typical: projectArea },
  ]

  const loadTypicalFitout = () => {
    const typicalMaterials = materialCategories.slice(0, 6).map(cat => ({
      id: generateId(),
      category: cat.name,
      quantity: cat.typical || 10000,
      unit: cat.unit,
      embodiedFactor: cat.factor,
      reusePercent: 0,
      totalEmissions: (cat.typical || 10000) * cat.factor,
    }))
    setMaterials(typicalMaterials)
    setShowQuickStart(false)
  }

  const addMaterial = (category: string, factor: number, unit: string) => {
    const newMaterial: Material = {
      id: generateId(),
      category,
      quantity: 0,
      unit,
      embodiedFactor: factor,
      reusePercent: 0,
      totalEmissions: 0,
    }
    setMaterials([...materials, newMaterial])
    setShowQuickStart(false)
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(
      materials.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates }
          // Recalculate emissions
          const netQuantity = updated.quantity * (1 - updated.reusePercent / 100)
          updated.totalEmissions = netQuantity * updated.embodiedFactor
          return updated
        }
        return m
      })
    )
  }

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  const totalEmbodiedCarbon = materials.reduce((sum, m) => sum + m.totalEmissions, 0)
  const transportEmissions = (totalEmbodiedCarbon / 1000) * (transportDistance / 100) * 0.05 // Simplified
  const totalWithTransport = totalEmbodiedCarbon + transportEmissions
  const embodiedPerSqFt = projectArea > 0 ? totalWithTransport / projectArea : 0
  const withinBudget = embodiedPerSqFt <= budgetPerSqFt

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Embodied Carbon LCA</h1>
              <p className="text-muted-foreground">
                Calculate and manage embodied carbon for fit-out projects
              </p>
            </div>
            <div className="flex gap-2">
              {materials.length === 0 && (
                <Button variant="outline" onClick={loadTypicalFitout}>
                  <Zap className="mr-2 h-4 w-4" />
                  Load Typical Fit-out
                </Button>
              )}
              <Button onClick={() => setShowQuickStart(!showQuickStart)}>
                <Calculator className="mr-2 h-4 w-4" />
                {materials.length > 0 ? 'Recalculate' : 'Start'}
              </Button>
            </div>
          </div>

          {/* Quick Start Guide */}
          {showQuickStart && materials.length === 0 && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle>Quick Start Guide</CardTitle>
                </div>
                <CardDescription>
                  Calculate embodied carbon for your construction project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                        onClick={loadTypicalFitout}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">Typical Office Fit-out</h3>
                          <Badge variant="secondary" className="mt-1">
                            ~{formatNumber(projectArea * 15, 0)} kgCO₂e
                          </Badge>
                        </div>
                        <Building className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pre-populated with standard materials and quantities for a {formatNumber(projectArea, 0)} sqft office space
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>6 common materials</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>Industry-standard quantities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>Fully customizable</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        Load Typical Fit-out
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">Custom Project</h3>
                          <Badge variant="outline" className="mt-1">Manual Entry</Badge>
                        </div>
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Start from scratch and add materials one by one
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Click "Add Material" below</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Enter exact quantities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Set reuse percentages</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline" onClick={() => setShowQuickStart(false)}>
                        Start Custom Project
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium">💡 Understanding Embodied Carbon:</p>
                  <p className="text-muted-foreground mt-1">
                    Embodied carbon is the total greenhouse gas emissions generated during the manufacture, transportation, and installation of building materials. Target: <span className="font-medium">&lt; 15 kgCO₂e/sqft</span> for sustainable construction.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Project Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>Configure project parameters</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Site</label>
                    <select
                      value={selectedSite}
                      onChange={(e) => setSelectedSite(e.target.value)}
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Project Area (sqft)</label>
                    <Input
                      type="number"
                      value={projectArea}
                      onChange={(e) => setProjectArea(parseFloat(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Carbon Budget (kgCO₂e/sqft)
                    </label>
                    <Input
                      type="number"
                      value={budgetPerSqFt}
                      onChange={(e) => setBudgetPerSqFt(parseFloat(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Transport Distance (km)
                    </label>
                    <Input
                      type="number"
                      value={transportDistance}
                      onChange={(e) => setTransportDistance(parseFloat(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Materials List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Materials Breakdown</CardTitle>
                      <CardDescription>Add materials and their quantities</CardDescription>
                    </div>
                    <div className="relative group">
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                      </Button>
                      <div className="absolute right-0 top-10 z-10 hidden group-hover:block w-64 rounded-lg border bg-card p-2 shadow-lg">
                        {materialCategories.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => addMaterial(cat.name, cat.factor, cat.unit)}
                            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                          >
                            {cat.name} ({cat.factor} kgCO₂e/{cat.unit})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {materials.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No materials added. Click "Add Material" to start.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {materials.map((material) => (
                        <Card key={material.id}>
                          <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                              <div>
                                <label className="text-sm font-medium">Category</label>
                                <Input
                                  value={material.category}
                                  disabled
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Quantity ({material.unit})
                                </label>
                                <Input
                                  type="number"
                                  value={material.quantity}
                                  onChange={(e) =>
                                    updateMaterial(material.id, {
                                      quantity: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Reuse %
                                </label>
                                <Input
                                  type="number"
                                  value={material.reusePercent}
                                  onChange={(e) =>
                                    updateMaterial(material.id, {
                                      reusePercent: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="mt-2"
                                  min="0"
                                  max="100"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Emissions (kgCO₂e)
                                </label>
                                <Input
                                  value={formatNumber(material.totalEmissions)}
                                  disabled
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                Factor: {material.embodiedFactor} kgCO₂e/{material.unit}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMaterial(material.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Embodied Carbon</CardTitle>
                  <CardDescription>Project carbon footprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Materials</div>
                      <div className="text-2xl font-bold">
                        {formatNumber(totalEmbodiedCarbon)} kgCO₂e
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Transport</div>
                      <div className="text-2xl font-bold">
                        {formatNumber(transportEmissions)} kgCO₂e
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-3xl font-bold">
                        {formatNumber(totalWithTransport)} kgCO₂e
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Per Square Foot</CardTitle>
                  <CardDescription>Intensity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {formatNumber(embodiedPerSqFt, 2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      kgCO₂e/sqft
                    </div>
                    <div className="mt-4">
                      {withinBudget ? (
                        <Badge variant="success" className="text-sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Within Budget
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-sm">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Exceeds Budget
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Status</CardTitle>
                  <CardDescription>Carbon budget tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Budget</span>
                      <span className="font-medium">
                        {formatNumber(budgetPerSqFt, 2)} kgCO₂e/sqft
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-medium">
                        {formatNumber(embodiedPerSqFt, 2)} kgCO₂e/sqft
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          withinBudget ? 'bg-success' : 'bg-destructive'
                        }`}
                        style={{
                          width: `${Math.min((embodiedPerSqFt / budgetPerSqFt) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {withinBudget ? (
                        <span className="text-success">
                          {formatNumber(((budgetPerSqFt - embodiedPerSqFt) / budgetPerSqFt) * 100)}
                          % under budget
                        </span>
                      ) : (
                        <span className="text-destructive">
                          {formatNumber(((embodiedPerSqFt - budgetPerSqFt) / budgetPerSqFt) * 100)}
                          % over budget
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Reduce embodied carbon</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <span>Increase material reuse percentage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <span>Source locally to reduce transport emissions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <span>Consider low-carbon alternatives (timber instead of steel)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <span>Request EPDs from all suppliers</span>
                    </div>
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

