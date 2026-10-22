'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieChartIcon } from 'lucide-react'

interface StatusData {
  name: string
  value: number
  color: string
}

interface JobStatusChartProps {
  data: StatusData[]
}

export function JobStatusChart({ data }: JobStatusChartProps) {
  const hasData = data.some((d) => d.value > 0)

  return (
    <Card className="rounded-xl border border-border/80 bg-white shadow-elevation-1">
      <CardHeader className="p-4 px-5 pb-2">
        <CardTitle className="text-sm font-semibold font-heading text-slate-900 flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-[#007ACC]" />
          Distribusi Status Pekerjaan
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Proporsi pekerjaan berdasarkan status siklus hidup saat ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 px-5 pt-2">
        {!hasData ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400">
            <PieChartIcon className="h-8 w-8 text-slate-200 mb-2" />
            <span>Belum ada data pekerjaan untuk ditampilkan.</span>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [`${String(val)} Pekerjaan`, 'Jumlah']}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
