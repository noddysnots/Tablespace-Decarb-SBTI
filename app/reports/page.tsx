'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { generateInvestorPPTX } from '@/lib/exports/pptx-generator'
import { generatePortfolioExcel } from '@/lib/exports/excel-generator'
import { downloadFile } from '@/lib/utils'
import {
  FileText,
  Download,
  FileSpreadsheet,
  Presentation,
  CheckCircle,
  Clock,
  FileCheck,
} from 'lucide-react'

export default function ReportsPage() {
  const { sites, scenarios, suppliers, getPortfolioEmissions } = useAppStore()
  const [loading, setLoading] = useState(false)
  const { totalEmissions } = getPortfolioEmissions()

  const handleExportPPTX = async () => {
    setLoading(true)
    try {
      const blob = await generateInvestorPPTX(scenarios, sites, totalEmissions)
      downloadFile(blob, `Decarb-Strategy-${new Date().toISOString().split('T')[0]}.pptx`)
    } catch (error) {
      console.error('Error generating PPTX:', error)
      alert('Error generating presentation')
    }
    setLoading(false)
  }

  const handleExportExcel = () => {
    setLoading(true)
    try {
      const blob = generatePortfolioExcel(sites, scenarios, suppliers, totalEmissions)
      downloadFile(blob, `Portfolio-Data-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error generating Excel:', error)
      alert('Error generating spreadsheet')
    }
    setLoading(false)
  }

  const handleExportPDF = () => {
    alert('PDF export coming soon!')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Reports & Exports</h1>
            <p className="text-muted-foreground">
              Generate investor-ready documents and data exports
            </p>
          </div>

          {/* Export Options */}
          <div className="mb-6 grid gap-6 md:grid-cols-3">
            {/* PPTX Export */}
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Presentation className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Investor Presentation</CardTitle>
                    <CardDescription>PowerPoint (PPTX)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Generate a 6-slide investor-ready presentation with:
                </p>
                <ul className="mb-4 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Executive summary
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Portfolio overview
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Emissions breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Decarbonization scenarios
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Investment requirements
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={handleExportPPTX}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PPTX
                </Button>
              </CardContent>
            </Card>

            {/* Excel Export */}
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-3">
                    <FileSpreadsheet className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Excel (XLSX)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Export comprehensive data tables including:
                </p>
                <ul className="mb-4 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Portfolio summary
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Site details
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Scenario comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Supplier scorecard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Emissions timeline
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={handleExportExcel}
                  disabled={loading}
                  variant="success"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>

            {/* PDF Export */}
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/10 p-3">
                    <FileText className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle>PDF Summary</CardTitle>
                    <CardDescription>Portable Document</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Generate a comprehensive PDF report with:
                </p>
                <ul className="mb-4 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Full portfolio analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Charts and visualizations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    SBTi compliance evidence
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    Coming soon
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={handleExportPDF}
                  disabled={true}
                  variant="warning"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SBTi Submission Pack */}
          <Card>
            <CardHeader>
              <CardTitle>SBTi Submission Pack</CardTitle>
              <CardDescription>
                Compile all required documents for SBTi target submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Required Documents</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-success" />
                        <span className="text-sm">Baseline emissions inventory</span>
                      </div>
                      <Badge variant="success">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-success" />
                        <span className="text-sm">Target scenarios</span>
                      </div>
                      <Badge variant="success">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="text-sm">Utility invoices</span>
                      </div>
                      <Badge variant="warning">Incomplete</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="text-sm">Supplier EPDs</span>
                      </div>
                      <Badge variant="warning">Partial</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Audit Trail</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintain a complete audit trail of all data sources, assumptions,
                    and methodologies used in your decarbonization strategy.
                  </p>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    View Data Gaps Report
                  </Button>
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Submission Pack
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>History of generated reports and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Presentation className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Investor Presentation</div>
                      <div className="text-sm text-muted-foreground">
                        Generated {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Export a report to see it here
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

