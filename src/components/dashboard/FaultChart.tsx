'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toPersianNumber } from '@/lib/persian'

interface FaultChartProps {
  data: { name: string; total: number; faults: number }[]
}

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

export function FaultChart({ data }: FaultChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">توزیع خرابی بر اساس دسته‌بندی</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(v) => toPersianNumber(v)} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [toPersianNumber(value), 'تعداد خرابی']}
                contentStyle={{ direction: 'rtl', fontFamily: 'Vazirmatn' }}
              />
              <Bar dataKey="faults" radius={[0, 4, 4, 0]} maxBarSize={32}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
