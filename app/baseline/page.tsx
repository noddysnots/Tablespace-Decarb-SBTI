'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { CheckCircle, ChevronRight, Upload } from 'lucide-react'

const steps = [
  { id: 1, name: 'Organizational Boundary', description: 'Define operational control' },
  { id: 2, name: 'Emission Factors', description: 'Grid factors and fuel properties' },
  { id: 3, name: 'Data Sources', description: 'Import utility bills and data' },
  { id: 4, name: 'Review & Confirm', description: 'Validate baseline assumptions' },
]

export default function BaselinePage() {
  const { assumptions, setAssumptions } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [localAssumptions, setLocalAssumptions] = useState(assumptions)

  const updateAssumption = (key: string, value: any) => {
    setLocalAssumptions({ ...localAssumptions, [key]: value })
  }

  const updateGridFactor = (state: string, value: number) => {
    setLocalAssumptions({
      ...localAssumptions,
      gridFactors: { ...localAssumptions.gridFactors, [state]: value },
    })
  }

  const saveAndContinue = () => {
    if (currentStep === 4) {
      setAssumptions(localAssumptions)
      alert('Baseline assumptions saved successfully!')
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Baseline Builder</h1>
            <p className="text-muted-foreground">
              Configure FY2025 baseline assumptions and data sources
            </p>
          </div>

          {/* Progress Steps */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          currentStep > step.id
                            ? 'bg-success text-white'
                            : currentStep === step.id
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <ChevronRight className="mx-4 h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Organizational Boundary</CardTitle>
                <CardDescription>
                  Define which operations are included in your baseline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Fiscal Year</label>
                  <Input
                    type="number"
                    value={localAssumptions.fiscalYear}
                    onChange={(e) =>
                      updateAssumption('fiscalYear', parseInt(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Operational Control Boundary</label>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Currently including: {localAssumptions.operationalControlBoundary.join(', ')}
                  </p>
                  <div className="mt-4 space-y-2">
                    {[
                      'Owned office buildings',
                      'Leased workspace',
                      'Data centers',
                      'Fleet vehicles',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={item}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={item} className="text-sm">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Emission Factors</CardTitle>
                <CardDescription>
                  Configure grid emission factors and fuel properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Grid Emission Factors (kgCO₂e/kWh)</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(localAssumptions.gridFactors)
                      .filter(([state]) => state !== 'default')
                      .map(([state, factor]) => (
                        <div key={state}>
                          <label className="text-sm font-medium">{state}</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={factor}
                            onChange={(e) =>
                              updateGridFactor(state, parseFloat(e.target.value))
                            }
                            className="mt-2"
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Fuel Properties</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">
                        Diesel Density (kg/liter)
                      </label>
                      <Input
                        type="number"
                        step="0.001"
                        value={localAssumptions.dieselDensity}
                        onChange={(e) =>
                          updateAssumption('dieselDensity', parseFloat(e.target.value))
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Diesel EF (kgCO₂e/kg)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={localAssumptions.dieselEmissionFactor}
                        onChange={(e) =>
                          updateAssumption('dieselEmissionFactor', parseFloat(e.target.value))
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        LPG EF (kgCO₂e/kg)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={localAssumptions.lpgEmissionFactor}
                        onChange={(e) =>
                          updateAssumption('lpgEmissionFactor', parseFloat(e.target.value))
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
                <CardDescription>
                  Import utility bills and site data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">Upload Utility Bills</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop Excel/CSV files or click to browse
                  </p>
                  <Button className="mt-4">Choose Files</Button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Accepted Formats</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Excel (.xlsx, .xls)</li>
                    <li>• CSV (.csv)</li>
                    <li>• PDF utility bills (OCR extraction)</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Required Fields</h3>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Site/Account ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Billing period</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Energy consumption (kWh)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Fuel usage (if applicable)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>
                  Validate baseline assumptions before saving
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Organizational Boundary</h3>
                  <div className="text-sm text-muted-foreground">
                    Fiscal Year: {localAssumptions.fiscalYear}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Key Emission Factors</h3>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      Default Grid Factor: {localAssumptions.gridFactors.default} kgCO₂e/kWh
                    </div>
                    <div>
                      Diesel EF: {localAssumptions.dieselEmissionFactor} kgCO₂e/kg
                    </div>
                    <div>
                      LPG EF: {localAssumptions.lpgEmissionFactor} kgCO₂e/kg
                    </div>
                    <div>
                      Diesel Density: {localAssumptions.dieselDensity} kg/L
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-success/10 border border-success/30 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <div className="font-medium text-success">Ready to Save</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your baseline assumptions are configured and ready to be applied
                        to your portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost">Save Draft</Button>
              <Button onClick={saveAndContinue}>
                {currentStep === 4 ? 'Save & Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

