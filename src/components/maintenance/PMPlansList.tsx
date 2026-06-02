'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, priorityLabels } from '@/lib/persian'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import {
  Plus, Calendar, Clock, Settings, AlertTriangle, CheckCircle,
  Zap, Timer, Edit, Trash2, Play
} from 'lucide-react'
import { toast } from 'sonner'

interface PMPlanWithStatus {
  id: string
  title: string
  description: string | null
  isActive: boolean
  intervalDays: number | null
  lastServiceAt: string | null
  nextDueAt: string | null
  intervalRunningHours: number | null
  lastServiceHours: number | null
  nextDueRunningHours: number | null
  leadTimeDays: number
  autoCreateWorkOrder: boolean
  priority: string
  checklistTemplate: string | null
  notes: string | null
  createdAt: string
  assetId: string
  asset: { nameFa: string; assetCode: string; id: string }
  currentRunningHours: number | null
  pmStatus: {
    isDue: boolean
    isUpcoming: boolean
    dueReason: 'time' | 'running_hours' | 'both' | null
    daysRemaining: number | null
    hoursRemaining: number | null
    overdueDays: number | null
    overdueHours: number | null
  }
  triggerType: 'time' | 'running_hours' | 'both'
  hasOpenWorkOrder: boolean
  workOrders: Array<{ id: string; status: string; title: string }>
}

const triggerTypeLabels: Record<string, string> = {
  time: 'بر اساس زمان',
  running_hours: 'بر اساس ساعت کارکرد',
  both: 'بر اساس زمان و ساعت کارکرد',
}

const dueReasonLabels: Record<string, string> = {
  time: 'بر اساس زمان',
  running_hours: 'بر اساس ساعت کارکرد',
  both: 'بر اساس زمان و ساعت کارکرد',
}

function PmStatusBadge({ pmStatus, triggerType }: { pmStatus: PMPlanWithStatus['pmStatus']; triggerType: PMPlanWithStatus['triggerType'] }) {
  if (pmStatus.isDue) {
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 font-medium">
        <AlertTriangle className="h-3 w-3 ml-1" />
        موعد رسیده
      </Badge>
    )
  }
  if (pmStatus.isUpcoming) {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 font-medium">
        <Clock className="h-3 w-3 ml-1" />
        نزدیک موعد
      </Badge>
    )
  }
  return (
    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 font-medium">
      <CheckCircle className="h-3 w-3 ml-1" />
      عادی
    </Badge>
  )
}

function PMPlanForm({ plan, assetId, onClose }: { plan?: PMPlanWithStatus | null; assetId?: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!plan

  const [form, setForm] = useState({
    assetId: plan?.assetId || assetId || '',
    title: plan?.title || '',
    description: plan?.description || '',
    intervalDays: plan?.intervalDays?.toString() || '',
    intervalRunningHours: plan?.intervalRunningHours?.toString() || '',
    lastServiceAt: plan?.lastServiceAt ? new Date(plan.lastServiceAt).toISOString().split('T')[0] : '',
    lastServiceHours: plan?.lastServiceHours?.toString() || '',
    leadTimeDays: plan?.leadTimeDays?.toString() || '3',
    autoCreateWorkOrder: plan?.autoCreateWorkOrder ?? true,
    priority: plan?.priority || 'medium',
    checklistTemplate: plan?.checklistTemplate || '',
    notes: plan?.notes || '',
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then(r => r.json()),
    enabled: !assetId,
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const url = isEdit ? `/api/pm-plans/${plan!.id}` : '/api/pm-plans'
      return fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-plans'] })
      toast.success(isEdit ? 'برنامه PM بروزرسانی شد' : 'برنامه PM با موفقیت ایجاد شد')
      onClose()
    },
    onError: () => toast.error(isEdit ? 'خطا در بروزرسانی برنامه PM' : 'خطا در ایجاد برنامه PM'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Record<string, unknown> = {
      assetId: form.assetId,
      title: form.title,
      description: form.description || null,
      intervalDays: form.intervalDays ? parseInt(form.intervalDays) : null,
      intervalRunningHours: form.intervalRunningHours ? parseFloat(form.intervalRunningHours) : null,
      leadTimeDays: parseInt(form.leadTimeDays) || 3,
      autoCreateWorkOrder: form.autoCreateWorkOrder,
      priority: form.priority,
      checklistTemplate: form.checklistTemplate || null,
      notes: form.notes || null,
    }

    if (!isEdit) {
      if (form.lastServiceAt) data.lastServiceAt = form.lastServiceAt
      if (form.lastServiceHours) data.lastServiceHours = parseFloat(form.lastServiceHours)
    } else {
      if (form.lastServiceAt) data.lastServiceAt = form.lastServiceAt
      if (form.lastServiceHours) data.lastServiceHours = parseFloat(form.lastServiceHours)
    }

    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">عنوان برنامه *</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="مثلاً: تعویض روغن دوره‌ای"
          required
        />
      </div>

      {!assetId && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">تجهیز *</Label>
          <Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })} required>
            <SelectTrigger><SelectValue placeholder="انتخاب تجهیز" /></SelectTrigger>
            <SelectContent>
              {assets.map((a: any) => (
                <SelectItem key={a.id} value={a.id}>{a.assetCode} - {a.nameFa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">بازه زمانی (روز)</Label>
          <Input
            type="number"
            value={form.intervalDays}
            onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}
            placeholder="مثلاً: 90"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">بازه ساعت کارکرد</Label>
          <Input
            type="number"
            step="0.1"
            value={form.intervalRunningHours}
            onChange={(e) => setForm({ ...form, intervalRunningHours: e.target.value })}
            placeholder="مثلاً: 500"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">آخرین سرویس</Label>
          <Input
            type="date"
            value={form.lastServiceAt}
            onChange={(e) => setForm({ ...form, lastServiceAt: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">ساعت کارکرد آخرین سرویس</Label>
          <Input
            type="number"
            step="0.1"
            value={form.lastServiceHours}
            onChange={(e) => setForm({ ...form, lastServiceHours: e.target.value })}
            placeholder="مثلاً: 1200"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">زمان هشدار قبلی (روز)</Label>
          <Input
            type="number"
            value={form.leadTimeDays}
            onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">اولویت</Label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
        <div>
          <Label className="text-sm font-medium">تولید خودکار دستور کار</Label>
          <p className="text-xs text-muted-foreground mt-0.5">دستور کار PM به صورت خودکار تولید شود</p>
        </div>
        <Switch
          checked={form.autoCreateWorkOrder}
          onCheckedChange={(v) => setForm({ ...form, autoCreateWorkOrder: v })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">شرح</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="شرح برنامه نگهداری پیشگیرانه..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">چک‌لیست</Label>
        <Textarea
          value={form.checklistTemplate}
          onChange={(e) => setForm({ ...form, checklistTemplate: e.target.value })}
          placeholder="اقدامات مورد نیاز (هر خط یک اقدام)..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">توضیحات</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="توضیحات اضافی..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t mt-4">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی' : 'ایجاد برنامه'}
        </Button>
      </div>
    </form>
  )
}

interface PMPlansListProps {
  assetId?: string
  showGenerate?: boolean
}

export function PMPlansList({ assetId, showGenerate = true }: PMPlansListProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PMPlanWithStatus | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<PMPlanWithStatus | null>(null)

  const queryParams = new URLSearchParams()
  if (assetId) queryParams.set('assetId', assetId)

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['pm-plans', assetId],
    queryFn: () => fetch(`/api/pm-plans?${queryParams}`).then(r => r.json()),
  })

  const generateMutation = useMutation({
    mutationFn: () => fetch('/api/pm-plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pm-plans'] })
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      if (data.summary?.created > 0) {
        toast.success(`${toPersianNumber(data.summary.created)} دستور کار PM تولید شد`)
      } else {
        toast.info('دستور کار جدیدی برای تولید وجود ندارد')
      }
    },
    onError: () => toast.error('خطا در تولید دستور کارهای PM'),
  })

  const deleteMutation = useMutation({
    mutationFn: (planId: string) =>
      fetch(`/api/pm-plans/${planId}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-plans'] })
      toast.success('برنامه PM حذف شد')
      setDeleteDialog(null)
    },
    onError: () => toast.error('خطا در حذف برنامه PM'),
  })

  const handleEdit = (plan: PMPlanWithStatus) => {
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingPlan(null)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-1" />
          برنامه PM جدید
        </Button>
        {showGenerate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <Play className="h-4 w-4 ml-1" />
            {generateMutation.isPending ? 'در حال تولید...' : 'تولید دستور کارهای PM'}
          </Button>
        )}
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
        <EmptyState
          icon={Settings}
          title="برنامه PM ثبت نشده"
          description="برای ایجاد برنامه نگهداری پیشگیرانه، از دکمه بالا استفاده کنید"
        />
      ) : (
        <div className="space-y-3">
          {plans.map((plan: PMPlanWithStatus) => (
            <Card key={plan.id} className={`border-0 shadow-sm ${
              plan.pmStatus.isDue ? 'border-r-4 border-r-red-500' :
              plan.pmStatus.isUpcoming ? 'border-r-4 border-r-amber-500' : ''
            }`}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {assetId ? '' : `${plan.asset?.nameFa} • ${plan.asset?.assetCode} • `}
                      {triggerTypeLabels[plan.triggerType]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PmStatusBadge pmStatus={plan.pmStatus} triggerType={plan.triggerType} />
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1.5">
                  {plan.intervalDays && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>بازه زمانی: {toPersianNumber(plan.intervalDays)} روز</span>
                      {plan.nextDueAt && (
                        <span className="mx-1">•</span>
                      )}
                      {plan.nextDueAt && (
                        <span>موعد بعدی: <PersianDate date={plan.nextDueAt} /></span>
                      )}
                    </div>
                  )}
                  {plan.intervalRunningHours && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" />
                      <span>بازه کارکرد: {toPersianNumber(plan.intervalRunningHours)} ساعت</span>
                      {plan.currentRunningHours !== null && (
                        <>
                          <span className="mx-1">•</span>
                          <span>کارکرد فعلی: {toPersianNumber(plan.currentRunningHours)} ساعت</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Details */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={plan.priority} />
                    {plan.autoCreateWorkOrder ? (
                      <Badge variant="outline" className="text-xs text-teal-600 dark:text-teal-400">
                        <Zap className="h-3 w-3 ml-0.5" />
                        خودکار
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        دستی
                      </Badge>
                    )}
                    {plan.hasOpenWorkOrder && (
                      <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400">
                        دستور کار باز
                      </Badge>
                    )}
                  </div>

                  {/* Remaining/Overdue info */}
                  <div className="text-xs">
                    {plan.pmStatus.isDue && plan.pmStatus.overdueDays && (
                      <span className="text-red-600 dark:text-red-400">
                        {toPersianNumber(plan.pmStatus.overdueDays)} روز تأخیر
                      </span>
                    )}
                    {plan.pmStatus.isDue && plan.pmStatus.overdueHours && (
                      <span className="text-red-600 dark:text-red-400">
                        {toPersianNumber(Math.round(plan.pmStatus.overdueHours))} ساعت تأخیر
                      </span>
                    )}
                    {plan.pmStatus.isUpcoming && plan.pmStatus.daysRemaining && (
                      <span className="text-amber-600 dark:text-amber-400">
                        {toPersianNumber(plan.pmStatus.daysRemaining)} روز مانده
                      </span>
                    )}
                    {plan.pmStatus.isUpcoming && plan.pmStatus.hoursRemaining && (
                      <span className="text-amber-600 dark:text-amber-400">
                        {toPersianNumber(plan.pmStatus.hoursRemaining)} ساعت مانده
                      </span>
                    )}
                    {!plan.pmStatus.isDue && !plan.pmStatus.isUpcoming && plan.pmStatus.daysRemaining && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {toPersianNumber(plan.pmStatus.daysRemaining)} روز مانده
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 mt-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(plan)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteDialog(plan)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Due Reason */}
                {plan.pmStatus.dueReason && (plan.pmStatus.isDue || plan.pmStatus.isUpcoming) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    دلیل: {dueReasonLabels[plan.pmStatus.dueReason]}
                    {plan.triggerType === 'running_hours' && plan.currentRunningHours === null && (
                      <span className="text-amber-500 mr-1">• ساعت کارکرد ثبت نشده</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingPlan(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{editingPlan ? 'ویرایش برنامه PM' : 'ایجاد برنامه PM جدید'}</DialogTitle>
          </DialogHeader>
          <PMPlanForm
            plan={editingPlan}
            assetId={assetId}
            onClose={() => { setShowForm(false); setEditingPlan(null) }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) setDeleteDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف برنامه PM</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            آیا از حذف برنامه &laquo;{deleteDialog?.title}&raquo; اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>انصراف</Button>
            <Button variant="destructive" onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog.id)}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
