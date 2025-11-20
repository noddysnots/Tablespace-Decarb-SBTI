'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { formatNumber } from '@/lib/utils'
import {
  Plus,
  Upload,
  Map as MapIcon,
  Table as TableIcon,
  Edit,
  Trash2,
  Search,
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map component (prevents SSR issues with leaflet)
const PortfolioMap = dynamic(() => import('@/components/portfolio/portfolio-map'), {
  ssr: false,
  loading: () => <div className="flex h-[500px] items-center justify-center">Loading map...</div>,
})

const SitesTable = dynamic(() => import('@/components/portfolio/sites-table'), {
  ssr: false,
})

export default function PortfolioPage() {
  const { sites, addSite } = useAppStore()
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalArea = sites.reduce((sum, site) => sum + site.areaSquareFeet, 0)
  const totalOccupancy = sites.reduce((sum, site) => sum + site.occupancy, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Portfolio & Sites</h1>
              <p className="text-muted-foreground">
                Manage your workspace portfolio across India
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Sites
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Site
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Sites</div>
                <div className="mt-2 text-2xl font-bold">{sites.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Area</div>
                <div className="mt-2 text-2xl font-bold">
                  {formatNumber(totalArea / 1000, 0)}K sqft
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Occupancy</div>
                <div className="mt-2 text-2xl font-bold">{formatNumber(totalOccupancy, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">States Covered</div>
                <div className="mt-2 text-2xl font-bold">
                  {new Set(sites.map((s) => s.state)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Controls */}
          <Card className="mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="secondary">{filteredSites.length} sites</Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="mr-2 h-4 w-4" />
                  Map View
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon className="mr-2 h-4 w-4" />
                  Table View
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map or Table View */}
          {viewMode === 'map' ? (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Map</CardTitle>
                <CardDescription>
                  Click on a site marker to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <PortfolioMap sites={filteredSites} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sites Table</CardTitle>
                <CardDescription>
                  Editable table with all site details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SitesTable sites={filteredSites} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

