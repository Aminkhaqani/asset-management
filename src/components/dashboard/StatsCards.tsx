'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, HardHat, Wrench, ClipboardCheck, Activity } from 'lucide-react'
import { toPersianNumber } from '@/lib/persian'
import { motion } from 'framer-motion'

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

const statItems = [
  { key: 'activeFaults', label: 'خرابی‌های فعال', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  { key: 'assetsDown', label: 'دارایی خارج از سرویس', icon: HardHat, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { key: 'overduePM', label: 'نگهداری تأخیری', icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'todayInspections', label: 'بازدیدهای امروز', icon: ClipboardCheck, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { key: 'availabilityPercent', label: 'دسترس‌پذیری دارایی‌ها', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', suffix: '%' },
  { key: 'openWorkOrders', label: 'دستورات کار باز', icon: Wrench, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
] as const

export function StatsCards({ stats }: StatsCardsProps) {
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
            <Card className="border-0 shadow-sm">
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
