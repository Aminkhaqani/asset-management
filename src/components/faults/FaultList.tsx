'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { faultTypeLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FaultForm } from './FaultForm'
import { Plus, AlertTriangle, Filter, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { assetTypeDefinitions, getAssetTypeLabel } from '@/lib/asset-types'

export function FaultList() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const [showForm, setShowForm] = useState(false)
  const [assetFilter, setAssetFilter] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [reporterFilter, setReporterFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState(navigationFilters.status ?? '')
  const [priorityFilter, setPriorityFilter] = useState(navigationFilters.priority ?? '')
  const [faultTypeFilter, setFaultTypeFilter] = useState(navigationFilters.faultType ?? '')
  const [showFilters, setShowFilters] = useState(Object.keys(navigationFilters).length > 0)

  // Apply navigation filters from dashboard on mount
  useEffect(() => {
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, [clearFilters, navigationFilters])

  const { data: faultsResponse = [], isLoading } = useQuery({
    queryKey: ['faults', assetFilter, assetTypeFilter, reporterFilter, dateFrom, dateTo, statusFilter, priorityFilter, faultTypeFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (assetFilter) params.set('assetId', assetFilter)
      if (assetTypeFilter) params.set('assetType', assetTypeFilter)
      if (reporterFilter) params.set('reportedById', reporterFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      if (faultTypeFilter) params.set('faultType', faultTypeFilter)
      return fetch(`/api/faults?${params}`).then(r => r.json())
    },
  })

  const { data: assetsResponse = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then(r => r.json()),
  })

  const { data: usersResponse = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const faults = Array.isArray(faultsResponse) ? faultsResponse : []
  const assets = Array.isArray(assetsResponse) ? assetsResponse : []
  const users = Array.isArray(usersResponse) ? usersResponse : []

  const hasActiveFilters = Boolean(assetFilter || assetTypeFilter || reporterFilter || dateFrom || dateTo || statusFilter || priorityFilter || faultTypeFilter)

  const clearAllFilters = () => {
    setAssetFilter('')
    setAssetTypeFilter('')
    setReporterFilter('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setPriorityFilter('')
    setFaultTypeFilter('')
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">خرابی‌ها</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 ml-1" />
          ثبت خرابی
        </Button>
      </div>

      {/* Filters */}
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
              {(statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0) + (faultTypeFilter ? 1 : 0)}
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
          <Select value={reporterFilter} onValueChange={(v) => setReporterFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="گزارش‌دهنده" /></SelectTrigger>
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
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="open">باز</SelectItem>
              <SelectItem value="in_progress">در حال انجام</SelectItem>
              <SelectItem value="resolved">رفع شده</SelectItem>
              <SelectItem value="closed">بسته شده</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="اولویت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="low">کم</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="high">زیاد</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
          <Select value={faultTypeFilter} onValueChange={(v) => setFaultTypeFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="نوع خرابی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              {Object.entries(faultTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="از تاریخ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="تا تاریخ" />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : faults.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>خرابی ثبت نشده</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-background">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.9fr] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>خرابی</span>
            <span>دارایی</span>
            <span>نوع دارایی</span>
            <span>گزارش‌دهنده</span>
            <span>تاریخ</span>
            <span className="text-left">وضعیت</span>
          </div>
          {faults.map((fault: any) => (
            <button
              key={fault.id}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-3 text-right transition-colors last:border-b-0 hover:bg-muted/50 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_0.9fr]"
              onClick={() => navigate('fault-detail', { faultId: fault.id })}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{fault.description}</span>
                <span className="block truncate text-xs text-muted-foreground">{faultTypeLabels[fault.faultType] || fault.faultType}</span>
              </span>
              <span className="hidden min-w-0 md:block">
                <span className="block truncate text-sm text-muted-foreground">{fault.asset?.nameFa}</span>
                <span className="block truncate text-xs text-muted-foreground">{fault.asset?.assetCode}</span>
              </span>
              <span className="hidden text-sm text-muted-foreground md:block">{getAssetTypeLabel(fault.asset?.assetType)}</span>
              <span className="hidden truncate text-sm text-muted-foreground md:block">{fault.reportedBy?.name || '—'}</span>
              <span className="hidden text-sm text-muted-foreground md:block"><PersianDate date={fault.reportedAt} relative /></span>
              <span className="flex flex-col items-end gap-1 md:items-start">
                <PriorityBadge priority={fault.priority} />
                <StatusBadge status={fault.status} />
              </span>
              <span className="col-span-2 text-xs text-muted-foreground md:hidden">
                {fault.asset?.nameFa} • {fault.reportedBy?.name || '—'} • <PersianDate date={fault.reportedAt} relative />
              </span>
            </button>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">ثبت خرابی جدید</DialogTitle>
          </DialogHeader>
          <FaultForm onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
