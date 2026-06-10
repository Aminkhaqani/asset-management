'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, recurrenceLabels, repairTypeLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Plus, Wrench, AlertTriangle, CheckCircle, Building2, Settings, CalendarClock, Filter, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { WorkOrderForm } from './WorkOrderForm'
import { PMPlansList } from './PMPlansList'
import { useState, useEffect } from 'react'
import { assetTypeDefinitions, getAssetTypeLabel } from '@/lib/asset-types'

function WorkOrderHeader() {
  return (
    <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.9fr] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
      <span>دستور کار</span>
      <span>دارایی</span>
      <span>نوع دارایی</span>
      <span>کارشناس</span>
      <span>زمان‌بندی</span>
      <span className="text-left">وضعیت</span>
    </div>
  )
}

export function MaintenancePage() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const clearFilters = useAppStore((s) => s.clearFilters)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'preventive' | 'corrective'>('preventive')
  const [activeTab, setActiveTab] = useState(
    navigationFilters.type === 'overdue' ? 'pm-due' :
    navigationFilters.type === 'corrective' ? 'cm' :
    'pm'
  )
  const [assetFilter, setAssetFilter] = useState(navigationFilters.assetId ?? '')
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState(navigationFilters.status ?? '')
  const [priorityFilter, setPriorityFilter] = useState(navigationFilters.priority ?? '')
  const [repairTypeFilter, setRepairTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(Object.keys(navigationFilters).length > 0)

  // Apply navigation filters from dashboard on mount
  useEffect(() => {
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, [clearFilters, navigationFilters])

  const buildWorkOrderUrl = (type: 'preventive' | 'corrective') => {
    const params = new URLSearchParams({ type })
    if (assetFilter) params.set('assetId', assetFilter)
    if (assetTypeFilter) params.set('assetType', assetTypeFilter)
    if (assigneeFilter) params.set('assignedToId', assigneeFilter)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    if (repairTypeFilter) params.set('repairType', repairTypeFilter)
    return `/api/work-orders?${params}`
  }

  const workOrderFilters = [assetFilter, assetTypeFilter, assigneeFilter, dateFrom, dateTo, statusFilter, priorityFilter, repairTypeFilter]

  const { data: pmOrdersResponse = [], isLoading: pmLoading } = useQuery({
    queryKey: ['work-orders', 'preventive', ...workOrderFilters],
    queryFn: () => fetch(buildWorkOrderUrl('preventive')).then(r => r.json()),
  })

  const { data: cmOrdersResponse = [], isLoading: cmLoading } = useQuery({
    queryKey: ['work-orders', 'corrective', ...workOrderFilters],
    queryFn: () => fetch(buildWorkOrderUrl('corrective')).then(r => r.json()),
  })

  const { data: duePlans = [] } = useQuery({
    queryKey: ['pm-plans', 'due-upcoming'],
    queryFn: () => fetch('/api/pm-plans?due=true&upcoming=true').then(r => r.json()),
  })

  const { data: assetsResponse = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then(r => r.json()),
  })

  const { data: usersResponse = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const pmOrders = Array.isArray(pmOrdersResponse) ? pmOrdersResponse : []
  const cmOrders = Array.isArray(cmOrdersResponse) ? cmOrdersResponse : []
  const assets = Array.isArray(assetsResponse) ? assetsResponse : []
  const users = Array.isArray(usersResponse) ? usersResponse : []

  const hasActiveFilters = Boolean(assetFilter || assetTypeFilter || assigneeFilter || dateFrom || dateTo || statusFilter || priorityFilter || repairTypeFilter)

  const clearAllFilters = () => {
    setAssetFilter('')
    setAssetTypeFilter('')
    setAssigneeFilter('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setPriorityFilter('')
    setRepairTypeFilter('')
  }

  const renderWorkOrder = (wo: any) => {
    const isOverdue = wo.status === 'overdue' || (wo.nextDueDate && new Date(wo.nextDueDate) < new Date() && wo.status !== 'completed' && wo.status !== 'approved')
    return (
      <button
        key={wo.id}
        className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-3 text-right transition-colors last:border-b-0 hover:bg-muted/50 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_0.9fr] ${isOverdue ? 'border-r-4 border-r-red-500' : ''}`}
        onClick={() => navigate('work-order-detail', { workOrderId: wo.id })}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{wo.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {wo.repairType === 'external' && wo.workshop ? `تعمیرگاه: ${wo.workshop.name}` : repairTypeLabels[wo.repairType] || 'داخلی'}
            {isOverdue ? ' • تأخیر یافته' : ''}
          </span>
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate text-sm text-muted-foreground">{wo.asset?.nameFa}</span>
          <span className="block truncate text-xs text-muted-foreground">{wo.asset?.assetCode}</span>
        </span>
        <span className="hidden text-sm text-muted-foreground md:block">{getAssetTypeLabel(wo.asset?.assetType)}</span>
        <span className="hidden truncate text-sm text-muted-foreground md:block">{wo.assignedTo?.name || 'بدون تخصیص'}</span>
        <span className="hidden text-sm text-muted-foreground md:block">{wo.recurrence ? recurrenceLabels[wo.recurrence] : <PersianDate date={wo.scheduledDate || wo.createdAt} />}</span>
        <span className="flex flex-col items-end gap-1 md:items-start">
          <PriorityBadge priority={wo.priority} />
          <StatusBadge status={wo.status} />
        </span>
        <span className="col-span-2 text-xs text-muted-foreground md:hidden">
          {wo.asset?.nameFa} • {wo.assignedTo?.name || 'بدون تخصیص'}
        </span>
      </button>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">نگهداری و تعمیرات</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 ml-1" />
          فیلتر
          {hasActiveFilters && (
            <span className="mr-1 bg-white/20 rounded-full px-1.5 text-xs">
              {[
                assetFilter,
                assetTypeFilter,
                assigneeFilter,
                dateFrom,
                dateTo,
                statusFilter,
                priorityFilter,
                repairTypeFilter,
              ].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-3.5 w-3.5 ml-1" />
            پاک‌سازی
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 rounded-lg border bg-muted/20 p-3">
          <Select value={assetFilter} onValueChange={(v) => setAssetFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="دارایی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه دارایی‌ها</SelectItem>
              {assets.map((asset: any) => (
                <SelectItem key={asset.id} value={asset.id}>{asset.assetCode} - {asset.nameFa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assetTypeFilter} onValueChange={(v) => setAssetTypeFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="نوع دارایی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه انواع</SelectItem>
              {assetTypeDefinitions.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="کارشناس/تکنسین" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه کاربران</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="وضعیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه وضعیت‌ها</SelectItem>
              <SelectItem value="pending">در انتظار</SelectItem>
              <SelectItem value="assigned">اختصاص یافته</SelectItem>
              <SelectItem value="in_progress">در حال انجام</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
              <SelectItem value="approved">تایید شده</SelectItem>
              <SelectItem value="overdue">معوق</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="اولویت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه اولویت‌ها</SelectItem>
              <SelectItem value="low">کم</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="high">زیاد</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
          <Select value={repairTypeFilter} onValueChange={(v) => setRepairTypeFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="نوع تعمیر" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="internal">داخلی</SelectItem>
              <SelectItem value="external">تعمیرگاه خارجی</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="از تاریخ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="تا تاریخ" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <div className="overflow-hidden rounded-lg border bg-background">
              <WorkOrderHeader />
              {pmOrders.map(renderWorkOrder)}
            </div>
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
            <div className="overflow-hidden rounded-lg border bg-background">
              <WorkOrderHeader />
              {cmOrders.map(renderWorkOrder)}
            </div>
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{formType === 'preventive' ? 'دستور کار نگهداری پیشگیرانه' : 'دستور کار تعمیرات اصلاحی'}</DialogTitle>
          </DialogHeader>
          <WorkOrderForm type={formType} onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
