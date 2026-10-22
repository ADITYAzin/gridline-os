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
    <Card className="rounded-xl border border-border/80 bg-white shadow-elevation-1">
      <CardHeader className="p-4 px-5 pb-2">
        <CardTitle className="text-sm font-semibold font-heading text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#007ACC]" />
          Pekerjaan Berdasarkan Jenis Layanan
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Volume order servis teratas di organisasi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 px-5 pt-2">
        {!hasData ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400">
            <BarChart3 className="h-8 w-8 text-slate-200 mb-2" />
            <span>Belum ada data servis untuk ditampilkan.</span>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} stroke="#E2E8F0" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: unknown) => [`${String(val)} Job`, 'Total']}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="count" fill="#007ACC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
