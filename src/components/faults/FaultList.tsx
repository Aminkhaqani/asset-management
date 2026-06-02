'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { faultTypeLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FaultForm } from './FaultForm'
import { Plus, AlertTriangle, Filter, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function FaultList() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [faultTypeFilter, setFaultTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Apply navigation filters from dashboard on mount
  useEffect(() => {
    if (navigationFilters.status) {
      setStatusFilter(navigationFilters.status)
      setShowFilters(true)
    }
    if (navigationFilters.priority) {
      setPriorityFilter(navigationFilters.priority)
      setShowFilters(true)
    }
    if (navigationFilters.faultType) {
      setFaultTypeFilter(navigationFilters.faultType)
      setShowFilters(true)
    }
    // Clear navigation filters after applying
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: faults = [], isLoading } = useQuery({
    queryKey: ['faults', statusFilter, priorityFilter, faultTypeFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      if (faultTypeFilter) params.set('faultType', faultTypeFilter)
      return fetch(`/api/faults?${params}`).then(r => r.json())
    },
  })

  const hasActiveFilters = statusFilter || priorityFilter || faultTypeFilter

  const clearAllFilters = () => {
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
        <div className="space-y-3">
          {faults.map((fault: any) => (
            <Card
              key={fault.id}
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('fault-detail', { faultId: fault.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{fault.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fault.asset?.nameFa} • {fault.asset?.assetCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {faultTypeLabels[fault.faultType] || fault.faultType} • {fault.reportedBy?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <PriorityBadge priority={fault.priority} />
                    <StatusBadge status={fault.status} />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                  <PersianDate date={fault.reportedAt} relative />
                </div>
              </CardContent>
            </Card>
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
