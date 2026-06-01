'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, recurrenceLabels, statusLabels, repairTypeLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Plus, Wrench, Clock, AlertTriangle, CheckCircle, Building2, Settings, CalendarClock } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { WorkOrderForm } from './WorkOrderForm'
import { PMPlansList } from './PMPlansList'
import { useState } from 'react'

export function MaintenancePage() {
  const navigate = useAppStore((s) => s.navigate)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'preventive' | 'corrective'>('preventive')

  const { data: pmOrders = [], isLoading: pmLoading } = useQuery({
    queryKey: ['work-orders', 'preventive'],
    queryFn: () => fetch('/api/work-orders?type=preventive').then(r => r.json()),
  })

  const { data: cmOrders = [], isLoading: cmLoading } = useQuery({
    queryKey: ['work-orders', 'corrective'],
    queryFn: () => fetch('/api/work-orders?type=corrective').then(r => r.json()),
  })

  const { data: duePlans = [] } = useQuery({
    queryKey: ['pm-plans', 'due-upcoming'],
    queryFn: () => fetch('/api/pm-plans?due=true&upcoming=true').then(r => r.json()),
  })

  const renderWorkOrder = (wo: any) => {
    const isOverdue = wo.status === 'overdue' || (wo.nextDueDate && new Date(wo.nextDueDate) < new Date() && wo.status !== 'completed' && wo.status !== 'approved')
    return (
      <Card
        key={wo.id}
        className={`border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-r-4 border-r-red-500' : ''}`}
        onClick={() => navigate('work-order-detail', { workOrderId: wo.id })}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{wo.title}</p>
              <p className="text-xs text-muted-foreground">{wo.asset?.nameFa} • {wo.asset?.assetCode}</p>
            </div>
            <StatusBadge status={wo.status} />
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={wo.priority} />
              {wo.assignedTo && (
                <span className="text-xs text-muted-foreground">{wo.assignedTo.name}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {wo.repairType === 'external' && wo.workshop && (
                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                  <Building2 className="h-3 w-3" />
                  {wo.workshop.name}
                </span>
              )}
              {wo.recurrence ? recurrenceLabels[wo.recurrence] : <PersianDate date={wo.scheduledDate} />}
            </div>
          </div>
          {isOverdue && (
            <div className="flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>تأخیر یافته</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">نگهداری و تعمیرات</h2>
      </div>

      <Tabs defaultValue="pm">
        <TabsList className="w-full">
          <TabsTrigger value="pm" className="flex-1">نگهداری پیشگیرانه</TabsTrigger>
          <TabsTrigger value="cm" className="flex-1">تعمیرات اصلاحی</TabsTrigger>
          <TabsTrigger value="pm-due" className="flex-1">
            <CalendarClock className="h-3.5 w-3.5 ml-1" />
            PMهای موعددار
          </TabsTrigger>
          <TabsTrigger value="pm-plans" className="flex-1">
            <Settings className="h-3.5 w-3.5 ml-1" />
            برنامه‌های PM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pm" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setFormType('preventive'); setShowForm(true) }}>
              <Plus className="h-4 w-4 ml-1" />
              دستور کار PM
            </Button>
          </div>
          {pmLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)
          ) : pmOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>دستور کار نگهداری پیشگیرانه‌ای ثبت نشده</p>
            </div>
          ) : (
            pmOrders.map(renderWorkOrder)
          )}
        </TabsContent>

        <TabsContent value="cm" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setFormType('corrective'); setShowForm(true) }}>
              <Plus className="h-4 w-4 ml-1" />
              دستور کار CM
            </Button>
          </div>
          {cmLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)
          ) : cmOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>دستور کار تعمیرات اصلاحی ثبت نشده</p>
            </div>
          ) : (
            cmOrders.map(renderWorkOrder)
          )}
        </TabsContent>

        <TabsContent value="pm-due" className="mt-3 space-y-3">
          {duePlans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>همه برنامه‌های PM در موعد هستند</p>
            </div>
          ) : (
            duePlans.map((plan: any) => (
              <Card key={plan.id} className={`border-0 shadow-sm ${
                plan.pmStatus.isDue ? 'border-r-4 border-r-red-500' : 'border-r-4 border-r-amber-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{plan.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.asset?.nameFa} • {plan.asset?.assetCode}
                      </p>
                    </div>
                    {plan.pmStatus.isDue ? (
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium shrink-0">موعد رسیده</span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium shrink-0">نزدیک موعد</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {plan.pmStatus.dueReason === 'time' ? 'بر اساس زمان' : plan.pmStatus.dueReason === 'running_hours' ? 'بر اساس ساعت کارکرد' : 'بر اساس زمان و ساعت کارکرد'}
                    </span>
                    <span>
                      {plan.pmStatus.overdueDays ? (
                        <span className="text-red-600 dark:text-red-400">{toPersianNumber(plan.pmStatus.overdueDays)} روز تأخیر</span>
                      ) : plan.pmStatus.daysRemaining ? (
                        <span className="text-amber-600 dark:text-amber-400">{toPersianNumber(plan.pmStatus.daysRemaining)} روز مانده</span>
                      ) : null}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pm-plans" className="mt-3">
          <PMPlansList />
        </TabsContent>
      </Tabs>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader className="px-5 pt-2 pb-1">
            <SheetTitle className="text-base">{formType === 'preventive' ? 'دستور کار نگهداری پیشگیرانه' : 'دستور کار تعمیرات اصلاحی'}</SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-6 overflow-y-auto flex-1">
            <WorkOrderForm type={formType} onClose={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
