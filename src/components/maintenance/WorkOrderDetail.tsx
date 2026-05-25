'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, recurrenceLabels, roleLabels, statusLabels } from '@/lib/persian'
import { ArrowRight, Wrench, User, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function WorkOrderDetail() {
  const { selectedWorkOrderId, navigate } = useAppStore()

  const { data: wo, isLoading } = useQuery({
    queryKey: ['work-order', selectedWorkOrderId],
    queryFn: () => fetch(`/api/work-orders/${selectedWorkOrderId}`).then(r => r.json()),
    enabled: !!selectedWorkOrderId,
  })

  if (isLoading) return <div className="p-4 space-y-4"><div className="h-40 rounded-xl bg-muted animate-pulse" /></div>
  if (!wo) return <div className="p-4 text-center">دستور کار یافت نشد</div>

  const parseJson = (str: string | null | undefined) => {
    if (!str) return []
    try { return JSON.parse(str) } catch { return [] }
  }

  const parts = parseJson(wo.partsConsumed)

  const workflowSteps = [
    { key: 'pending', label: 'در انتظار' },
    { key: 'assigned', label: 'اختصاص یافته' },
    { key: 'in_progress', label: 'در حال انجام' },
    { key: 'completed', label: 'تکمیل شده' },
    { key: 'approved', label: 'تأیید شده' },
  ]

  const currentStepIdx = workflowSteps.findIndex(s => s.key === wo.status)

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('maintenance')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{wo.title}</h2>
          <p className="text-sm text-muted-foreground">{wo.asset?.nameFa} • {wo.asset?.assetCode}</p>
        </div>
        <PriorityBadge priority={wo.priority} />
      </div>

      {/* Status & Type */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">نوع:</span>
              <span className="text-sm font-medium">{wo.type === 'preventive' ? 'نگهداری پیشگیرانه' : 'تعمیرات اصلاحی'}</span>
            </div>
            <StatusBadge status={wo.status} />
          </div>
          
          {/* Workflow Progress */}
          <div className="flex items-center gap-1 mt-3">
            {workflowSteps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className={`flex-1 h-2 rounded-full ${i <= currentStepIdx ? 'bg-teal-500' : 'bg-muted'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {workflowSteps.map((step) => (
              <span key={step.key} className="flex-1 text-center">{step.label}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">جزئیات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wo.description && <p className="text-sm">{wo.description}</p>}
          {wo.assignedTo && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">تکنسین:</span>
              <span className="font-medium">{wo.assignedTo.name} ({roleLabels[wo.assignedTo.role]})</span>
            </div>
          )}
          {wo.scheduledDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">تاریخ برنامه:</span>
              <PersianDate date={wo.scheduledDate} />
            </div>
          )}
          {wo.recurrence && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">دوره تکرار:</span>
              <span className="font-medium">{recurrenceLabels[wo.recurrence]}</span>
            </div>
          )}
          {wo.startedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">شروع:</span>
              <PersianDate date={wo.startedAt} time />
            </div>
          )}
          {wo.completedAt && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">تکمیل:</span>
              <PersianDate date={wo.completedAt} time />
            </div>
          )}
          {wo.approvedBy && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              <span className="text-muted-foreground">تأییدکننده:</span>
              <span className="font-medium">{wo.approvedBy.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts Consumed */}
      {parts.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">قطعات مصرفی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {parts.map((part: string, i: number) => (
                <Badge key={i} variant="secondary">{part}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {wo.notes && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">یادداشت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{wo.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Related Fault */}
      {wo.fault && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              خرابی مرتبط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate('fault-detail', { faultId: wo.fault.id })}
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
            >
              مشاهده خرابی
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
