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
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Distribusi Status Pekerjaan
        </CardTitle>
        <CardDescription className="text-xs">
          Proporsi pekerjaan berdasarkan status siklus hidup saat ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
            Belum ada data pekerjaan untuk ditampilkan.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
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
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
