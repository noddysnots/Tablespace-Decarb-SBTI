'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { Supplier } from '@/lib/types'
import { formatNumber, generateId } from '@/lib/utils'
import {
  Plus,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react'

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-danger'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 70) return 'success'
    if (score >= 50) return 'warning'
    return 'destructive'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-danger" />
      default:
        return <Clock className="h-5 w-5 text-warning" />
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
              <h1 className="text-3xl font-bold">Supplier Scorecard</h1>
              <p className="text-muted-foreground">
                Evaluate and onboard sustainable suppliers
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export RFP
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Suppliers</div>
                <div className="mt-2 text-2xl font-bold">{suppliers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="mt-2 text-2xl font-bold text-success">
                  {suppliers.filter((s) => s.status === 'approved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Pending Review</div>
                <div className="mt-2 text-2xl font-bold text-warning">
                  {suppliers.filter((s) => s.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Avg. Score</div>
                <div className="mt-2 text-2xl font-bold">
                  {suppliers.length > 0
                    ? formatNumber(
                        suppliers.reduce((sum, s) => sum + s.score, 0) / suppliers.length,
                        0
                      )
                    : 0}
                  /100
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'approved', 'pending', 'rejected'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <Badge variant="secondary">{filteredSuppliers.length} suppliers</Badge>
            </CardContent>
          </Card>

          {/* Suppliers Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription>{supplier.category}</CardDescription>
                    </div>
                    {getStatusIcon(supplier.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score */}
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold ${getScoreColor(supplier.score)}`}
                    >
                      {supplier.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Sustainability Score</div>
                    <Badge
                      variant={getScoreBadge(supplier.score) as any}
                      className="mt-2"
                    >
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>EPD Available</span>
                      {supplier.criteria.hasEPD ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>GHG Inventory</span>
                      {supplier.criteria.hasGHGInventory ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Net-Zero Commitment</span>
                      {supplier.criteria.hasNetZeroCommitment ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Circularity Program</span>
                      {supplier.criteria.hasCircularityProgram ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  {supplier.criteria.certifications.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">Certifications</div>
                      <div className="flex flex-wrap gap-2">
                        {supplier.criteria.certifications.map((cert, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                    {supplier.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() =>
                            updateSupplier(supplier.id, { status: 'approved' })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateSupplier(supplier.id, { status: 'rejected' })
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No suppliers found matching your criteria
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scoring Criteria Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Scoring Criteria</CardTitle>
              <CardDescription>How supplier sustainability scores are calculated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="font-medium">EPD Available</div>
                  <div className="text-2xl font-bold text-primary">30 points</div>
                  <p className="text-sm text-muted-foreground">
                    Environmental Product Declaration
                  </p>
                </div>
                <div>
                  <div className="font-medium">GHG Inventory</div>
                  <div className="text-2xl font-bold text-primary">25 points</div>
                  <p className="text-sm text-muted-foreground">
                    Published greenhouse gas inventory
                  </p>
                </div>
                <div>
                  <div className="font-medium">Net-Zero Commitment</div>
                  <div className="text-2xl font-bold text-primary">25 points</div>
                  <p className="text-sm text-muted-foreground">
                    Science-based net-zero target
                  </p>
                </div>
                <div>
                  <div className="font-medium">Circularity Program</div>
                  <div className="text-2xl font-bold text-primary">20 points</div>
                  <p className="text-sm text-muted-foreground">
                    Circular economy initiatives
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm">
                  <strong>Approval threshold:</strong> 70+ points (Automatic approval)
                  <br />
                  <strong>Review threshold:</strong> 50-69 points (Manual review required)
                  <br />
                  <strong>Below 50 points:</strong> Supplier improvement plan needed
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

