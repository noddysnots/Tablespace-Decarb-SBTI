'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Site } from '@/lib/types'
import { formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface PortfolioMapProps {
  sites: Site[]
}

function MapBounds({ sites }: { sites: Site[] }) {
  const map = useMap()

  useEffect(() => {
    if (sites.length > 0) {
      const bounds = L.latLngBounds(
        sites.map((site) => [site.latitude, site.longitude])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [sites, map])

  return null
}

export default function PortfolioMap({ sites }: PortfolioMapProps) {
  // Default center: India
  const center: [number, number] = [20.5937, 78.9629]

  // Calculate circle radius based on area (square root for better visualization)
  const getRadius = (areaSquareFeet: number) => {
    return Math.sqrt(areaSquareFeet) / 50
  }

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds sites={sites} />

      {sites.map((site) => (
        <CircleMarker
          key={site.id}
          center={[site.latitude, site.longitude]}
          radius={getRadius(site.areaSquareFeet)}
          pathOptions={{
            fillColor: '#3b82f6',
            fillOpacity: 0.6,
            color: '#1e40af',
            weight: 2,
          }}
        >
          <Popup maxWidth={300}>
            <div className="p-2">
              <h3 className="mb-2 font-bold text-lg">{site.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">
                    {site.city}, {site.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">
                    {formatNumber(site.areaSquareFeet, 0)} sqft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupancy:</span>
                  <span className="font-medium">{site.occupancy} people</span>
                </div>
                {site.measuredKWh && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual kWh:</span>
                    <span className="font-medium">
                      {formatNumber(site.measuredKWh, 0)}
                    </span>
                  </div>
                )}
                {site.solarInstalledKW && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="success" className="text-xs">
                      Solar: {site.solarInstalledKW} kW
                    </Badge>
                  </div>
                )}
              </div>
              <Button size="sm" className="mt-3 w-full">
                View Details
              </Button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

