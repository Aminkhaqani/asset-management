'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { StatsCards } from './StatsCards'
import { FaultChart } from './FaultChart'
import { RecentActivity } from './RecentActivity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toPersianNumber } from '@/lib/persian'
import { faultTypeLabels } from '@/lib/persian'
import { AlertTriangle } from 'lucide-react'

export function DashboardPage() {
  const navigate = useAppStore((s) => s.navigate)

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => {
      if (!r.ok) throw new Error('Failed to load dashboard')
      return r.json()
    }),
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !data?.stats) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">خطا در بارگذاری داشبورد</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            اتصال به دیتابیس برقرار نیست یا جداول ایجاد نشده‌اند. لطفاً مطمئن شوید که دیتابیس تنظیم شده است.
          </p>
          <button
            onClick={() => window.location.href = '/api/seed'}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            راه‌اندازی دیتابیس نمونه
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <StatsCards stats={data.stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FaultChart data={data.faultByCategory} />
        <RecentActivity events={data.recentTimeline} />
      </div>

      {/* Most Problematic Equipment */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            تجهیزات پرخطر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.mostProblematic.map((asset: any) => (
              <button
                key={asset.id}
                onClick={() => navigate('asset-detail', { assetId: asset.id })}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asset.nameFa}</p>
                    <p className="text-xs text-muted-foreground">{asset.assetCode} • {asset.category?.nameFa}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={asset.criticality} />
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {toPersianNumber(asset._count.faults)} خرابی
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Faults */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">خرابی‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentFaults.map((fault: any) => (
              <button
                key={fault.id}
                onClick={() => navigate('fault-detail', { faultId: fault.id })}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-right"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{fault.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {fault.asset?.nameFa} • {faultTypeLabels[fault.faultType] || fault.faultType}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={fault.priority} />
                  <StatusBadge status={fault.status} />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
