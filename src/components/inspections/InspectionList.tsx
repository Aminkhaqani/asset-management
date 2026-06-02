'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { shiftLabels, statusLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, ClipboardCheck, ArrowRight, Filter, X } from 'lucide-react'
import { InspectionForm } from './InspectionForm'
import { InspectionDetail } from './InspectionDetail'
import { AssetQRScanner } from '@/components/shared/AssetQRScanner'
import { useState, useEffect } from 'react'

type InspectionStep = 'list' | 'scan' | 'form' | 'detail'

export function InspectionList() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const selectedInspectionId = useAppStore((s) => s.selectedInspectionId)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const [step, setStep] = useState<InspectionStep>('list')
  const [scannedAsset, setScannedAsset] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [shiftFilter, setShiftFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewingInspectionId, setViewingInspectionId] = useState<string | null>(null)

  // Navigate to detail if selectedInspectionId is set
  useEffect(() => {
    if (selectedInspectionId) {
      setViewingInspectionId(selectedInspectionId)
      setStep('detail')
    }
  }, [selectedInspectionId])

  // Apply navigation filters from dashboard on mount
  useEffect(() => {
    if (navigationFilters.status) {
      setStatusFilter(navigationFilters.status)
      setShowFilters(true)
    }
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewInspection = () => {
    setScannedAsset(null)
    setStep('scan')
  }

  const handleAssetFound = (asset: any) => {
    setScannedAsset(asset)
  }

  const handleContinueToForm = () => {
    setStep('form')
  }

  const handleBack = () => {
    if (step === 'form') {
      setStep('scan')
    } else if (step === 'scan') {
      setStep('list')
      setScannedAsset(null)
    } else if (step === 'detail') {
      setStep('list')
      setViewingInspectionId(null)
    }
  }

  const handleClose = () => {
    setStep('list')
    setScannedAsset(null)
  }

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections', statusFilter, shiftFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (shiftFilter) params.set('shift', shiftFilter)
      return fetch(`/api/inspections?${params}`).then(r => r.json())
    },
  })

  const hasActiveFilters = statusFilter || shiftFilter

  // Detail step
  if (step === 'detail' && viewingInspectionId) {
    return <InspectionDetail inspectionId={viewingInspectionId} onBack={handleBack} />
  }

  // Scan step
  if (step === 'scan') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold">اسکن تجهیز</h2>
        </div>

        <AssetQRScanner
          onAssetFound={handleAssetFound}
          onContinue={handleContinueToForm}
        />
      </div>
    )
  }

  // Form step
  if (step === 'form' && scannedAsset) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold">ثبت بازدید</h2>
        </div>

        <InspectionForm
          asset={scannedAsset}
          onClose={handleClose}
        />
      </div>
    )
  }

  // List step (default)
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">بازدیدها</h2>
        <Button onClick={handleNewInspection}>
          <Plus className="h-4 w-4 ml-1" />
          بازدید جدید
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
              {(statusFilter ? 1 : 0) + (shiftFilter ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setShiftFilter('') }}>
            <X className="h-3.5 w-3.5 ml-1" />
            پاک‌سازی
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="وضعیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="normal">عادی</SelectItem>
              <SelectItem value="warning">هشدار</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
          <Select value={shiftFilter} onValueChange={(v) => setShiftFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="شیفت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="morning">صبحی</SelectItem>
              <SelectItem value="afternoon">عصر</SelectItem>
              <SelectItem value="night">شب</SelectItem>
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
      ) : inspections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>بازدیدی ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp: any) => (
            <Card
              key={insp.id}
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => { setViewingInspectionId(insp.id); setStep('detail') }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{insp.asset?.nameFa}</p>
                    <p className="text-xs text-muted-foreground">{insp.asset?.assetCode}</p>
                  </div>
                  <StatusBadge status={insp.status} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{insp.inspector?.name}</span>
                    <span>{shiftLabels[insp.shift || ''] || '—'}</span>
                  </div>
                  <PersianDate date={insp.date} relative />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
