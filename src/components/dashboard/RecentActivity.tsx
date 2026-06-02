'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/persian'
import { Clock, AlertTriangle, Wrench, CheckCircle, ArrowUpDown, ClipboardCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { CheckCircle as CheckCircleIcon } from 'lucide-react'

interface RecentActivityProps {
  events: Array<{
    id: string
    eventType: string
    title: string
    description: string | null
    performedBy: string | null
    eventDate: string
    relatedId?: string | null
    relatedType?: string | null
    assetId?: string | null
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

export function RecentActivity({ events }: RecentActivityProps) {
  const navigate = useAppStore((s) => s.navigate)

  const handleEventClick = (event: typeof events[0]) => {
    // Navigate based on event type
    if (event.eventType === 'fault' && event.relatedId) {
      navigate('fault-detail', { faultId: event.relatedId })
    } else if (event.eventType === 'inspection' && event.relatedId) {
      navigate('inspection-detail', { inspectionId: event.relatedId })
    } else if ((event.eventType === 'maintenance' || event.eventType === 'repair') && event.relatedId) {
      navigate('work-order-detail', { workOrderId: event.relatedId })
    } else if (event.assetId) {
      navigate('asset-detail', { assetId: event.assetId })
    }
  }

  const isClickable = (event: typeof events[0]) => {
    return !!(
      (event.eventType === 'fault' && event.relatedId) ||
      (event.eventType === 'inspection' && event.relatedId) ||
      ((event.eventType === 'maintenance' || event.eventType === 'repair') && event.relatedId) ||
      event.assetId
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">فعالیت‌های اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {events.map((event, i) => {
            const Icon = eventIcons[event.eventType] || Clock
            const color = eventColors[event.eventType] || 'bg-gray-100 text-gray-700'
            const clickable = isClickable(event)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => clickable && handleEventClick(event)}
                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                  clickable ? 'cursor-pointer hover:bg-muted/80 active:bg-muted' : ''
                }`}
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
                {clickable && (
                  <span className="text-xs text-muted-foreground mt-1 shrink-0">←</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
