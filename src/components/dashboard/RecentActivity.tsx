'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/persian'
import { Clock, AlertTriangle, Wrench, CheckCircle, ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface RecentActivityProps {
  events: Array<{
    id: string
    eventType: string
    title: string
    description: string | null
    performedBy: string | null
    eventDate: string
  }>
}

const eventIcons: Record<string, React.ElementType> = {
  inspection: ClipboardCheck,
  fault: AlertTriangle,
  maintenance: Wrench,
  repair: Wrench,
  replacement: ArrowUpDown,
  shutdown: AlertTriangle,
  startup: CheckCircle,
  calibration: Wrench,
  note: Clock,
  installed: CheckCircle,
}

const eventColors: Record<string, string> = {
  inspection: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  fault: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  maintenance: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  repair: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  shutdown: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  startup: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

import { ClipboardCheck } from 'lucide-react'
import { CheckCircle as CheckCircleIcon } from 'lucide-react'

export function RecentActivity({ events }: RecentActivityProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">فعالیت‌های اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {events.map((event, i) => {
            const Icon = eventIcons[event.eventType] || Clock
            const color = eventColors[event.eventType] || 'bg-gray-100 text-gray-700'
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className={`p-1.5 rounded-full mt-0.5 ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.performedBy && (
                      <span className="text-xs text-muted-foreground">{event.performedBy}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.eventDate)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
