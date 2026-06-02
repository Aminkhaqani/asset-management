'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, HardHat, Wrench, ClipboardCheck, Activity } from 'lucide-react'
import { toPersianNumber } from '@/lib/persian'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

interface StatsCardsProps {
  stats: {
    activeFaults: number
    assetsDown: number
    overduePM: number
    todayInspections: number
    openWorkOrders: number
    availabilityPercent: number
  }
}

interface StatItemDef {
  key: string
  label: string
  icon: React.ElementType
  color: string
  bg: string
  suffix?: string
  navigateTo?: string
  filters?: Record<string, string>
}

const statItems: StatItemDef[] = [
  { key: 'activeFaults', label: 'خرابی‌های فعال', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', navigateTo: 'faults', filters: { status: 'open' } },
  { key: 'assetsDown', label: 'دارایی خارج از سرویس', icon: HardHat, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', navigateTo: 'assets', filters: { status: 'faulty' } },
  { key: 'overduePM', label: 'نگهداری تأخیری', icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', navigateTo: 'maintenance', filters: { type: 'overdue' } },
  { key: 'todayInspections', label: 'بازدیدهای امروز', icon: ClipboardCheck, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', navigateTo: 'inspections' },
  { key: 'availabilityPercent', label: 'دسترس‌پذیری دارایی‌ها', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', suffix: '%', navigateTo: 'assets', filters: { status: 'active' } },
  { key: 'openWorkOrders', label: 'دستورات کار باز', icon: Wrench, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', navigateTo: 'maintenance', filters: { type: 'open' } },
]

export function StatsCards({ stats }: StatsCardsProps) {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, i) => {
        const value = stats[item.key as keyof typeof stats]
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.97]"
              onClick={() => {
                if (item.navigateTo) {
                  navigate(item.navigateTo as any, { filters: item.filters })
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold leading-none">
                      {toPersianNumber(value)}
                      {item.suffix && <span className="text-base mr-0.5">{item.suffix}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
