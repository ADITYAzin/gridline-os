'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface ServiceData {
  type: string
  count: number
}

interface ServiceTypeChartProps {
  data: ServiceData[]
}

export function ServiceTypeChart({ data }: ServiceTypeChartProps) {
  const hasData = data.length > 0

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Pekerjaan Berdasarkan Jenis Layanan
        </CardTitle>
        <CardDescription className="text-xs">
          Volume order servis teratas di organisasi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
            Belum ada data servis untuk ditampilkan.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: unknown) => [`${String(val)} Job`, 'Total']}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
