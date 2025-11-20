'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TimeSeriesDataPoint } from '@/lib/types'

interface EmissionsChartProps {
  data: TimeSeriesDataPoint[]
  showTarget?: boolean
}

export function EmissionsChart({ data, showTarget = true }: EmissionsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emissions Trajectory</CardTitle>
        <CardDescription>
          Historical and projected emissions with SBTi target pathway
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                label={{ value: 'Emissions (tCO₂e)', angle: -90, position: 'insideLeft' }}
                className="text-sm"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="emissions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Actual/Projected"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              {showTarget && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="SBTi Target"
                  dot={{ fill: 'hsl(var(--success))' }}
                />
              )}
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

