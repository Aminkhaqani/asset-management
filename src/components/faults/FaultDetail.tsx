'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { faultTypeLabels, roleLabels } from '@/lib/persian'
import { ArrowRight, AlertTriangle, User, Wrench, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function FaultDetail() {
  const { selectedFaultId, navigate } = useAppStore()

  const { data: fault, isLoading } = useQuery({
    queryKey: ['fault', selectedFaultId],
    queryFn: () => fetch(`/api/faults/${selectedFaultId}`).then(r => r.json()),
    enabled: !!selectedFaultId,
  })

  if (isLoading) return <div className="p-4 space-y-4"><div className="h-40 rounded-xl bg-muted animate-pulse" /></div>
  if (!fault) return <div className="p-4 text-center">خرابی یافت نشد</div>

  const statusTimeline = [
    { label: 'ثبت شده', date: fault.reportedAt, done: true },
    { label: 'در حال بررسی', date: fault.status !== 'open' ? fault.reportedAt : null, done: ['in_progress', 'resolved', 'closed'].includes(fault.status) },
    { label: 'رفع شده', date: fault.resolvedAt, done: ['resolved', 'closed'].includes(fault.status) },
    { label: 'بسته شده', date: fault.closedAt || fault.resolvedAt, done: fault.status === 'closed' },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('faults')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">جزئیات خرابی</h2>
          <p className="text-sm text-muted-foreground">{fault.asset?.nameFa} • {fault.asset?.assetCode}</p>
        </div>
        <PriorityBadge priority={fault.priority} />
      </div>

      {/* Status & Type */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">نوع:</span>
              <span className="font-medium">{faultTypeLabels[fault.faultType] || fault.faultType}</span>
            </div>
            <StatusBadge status={fault.status} />
          </div>
          
          {/* Status Timeline */}
          <div className="flex items-center gap-2 mt-3">
            {statusTimeline.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done ? 'border-teal-500 bg-teal-500' : 'border-muted-foreground/30'}`}>
                  {step.done && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                {i < statusTimeline.length - 1 && <div className={`flex-1 h-0.5 ${step.done ? 'bg-teal-500' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {statusTimeline.map((step, i) => (
              <span key={i} className="flex-1 text-center">{step.label}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">شرح خرابی</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{fault.description}</p>
        </CardContent>
      </Card>

      {/* Reporter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">گزارش‌دهنده:</span>
            <span className="font-medium">{fault.reportedBy?.name} ({roleLabels[fault.reportedBy?.role]})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">تاریخ گزارش:</span>
            <PersianDate date={fault.reportedAt} time />
          </div>
          {fault.resolvedAt && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">تاریخ رفع:</span>
              <PersianDate date={fault.resolvedAt} time />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution */}
      {fault.resolution && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">نحوه رفع</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{fault.resolution}</p>
          </CardContent>
        </Card>
      )}

      {/* Related Work Orders */}
      {fault.workOrders && fault.workOrders.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              دستورات کار مرتبط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fault.workOrders.map((wo: any) => (
                <button
                  key={wo.id}
                  onClick={() => navigate('work-order-detail', { workOrderId: wo.id })}
                  className="w-full text-right flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{wo.title}</p>
                    <p className="text-xs text-muted-foreground">{wo.assignedTo?.name || 'بدون تخصیص'}</p>
                  </div>
                  <StatusBadge status={wo.status} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
