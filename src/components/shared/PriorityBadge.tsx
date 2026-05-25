'use client'

import { Badge } from '@/components/ui/badge'
import { priorityLabels, criticalityLabels } from '@/lib/persian'

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function PriorityBadge({ priority }: { priority: string }) {
  const color = priorityColors[priority] || 'bg-gray-100 text-gray-800'
  const label = priorityLabels[priority] || priority
  return <Badge variant="outline" className={`${color} border-0 font-medium`}>{label}</Badge>
}

export function CriticalityBadge({ criticality }: { criticality: string }) {
  const color = priorityColors[criticality] || 'bg-gray-100 text-gray-800'
  const label = criticalityLabels[criticality] || criticality
  return <Badge variant="outline" className={`${color} border-0 font-medium`}>{label}</Badge>
}
