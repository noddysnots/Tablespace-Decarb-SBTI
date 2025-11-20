'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

interface KPITileProps {
  title: string
  value: string | number
  unit: string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ReactNode
  colorScheme?: 'default' | 'success' | 'warning' | 'danger'
}

export function KPITile({
  title,
  value,
  unit,
  change,
  trend,
  icon,
  colorScheme = 'default',
}: KPITileProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4" />
      case 'down':
        return <ArrowDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    // For emissions, down is good (green), up is bad (red)
    if (title.toLowerCase().includes('emission')) {
      if (trend === 'down') return 'text-success'
      if (trend === 'up') return 'text-danger'
    }
    // For renewable %, up is good
    if (title.toLowerCase().includes('renewable')) {
      if (trend === 'up') return 'text-success'
      if (trend === 'down') return 'text-danger'
    }
    return 'text-muted-foreground'
  }

  const getColorScheme = () => {
    const colors = {
      default: 'border-border',
      success: 'border-success/30 bg-success/5',
      warning: 'border-warning/30 bg-warning/5',
      danger: 'border-danger/30 bg-danger/5',
    }
    return colors[colorScheme]
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', getColorScheme())}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {typeof value === 'number' ? formatNumber(value) : value}
              </span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
            {change !== undefined && (
              <div className={cn('mt-2 flex items-center gap-1', getTrendColor())}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs baseline</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

