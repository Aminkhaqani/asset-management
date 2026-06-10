'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { shiftLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, ClipboardCheck, ArrowRight, Filter, X } from 'lucide-react'
import { InspectionForm } from './InspectionForm'
import { InspectionDetail } from './InspectionDetail'
import { AssetQRScanner } from '@/components/shared/AssetQRScanner'
import { useState, useEffect } from 'react'
import { assetTypeDefinitions, getAssetTypeLabel } from '@/lib/asset-types'

type InspectionStep = 'list' | 'scan' | 'form' | 'detail'

export function InspectionList() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const selectedInspectionId = useAppStore((s) => s.selectedInspectionId)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const [step, setStep] = useState<InspectionStep>(selectedInspectionId ? 'detail' : 'list')
  const [scannedAsset, setScannedAsset] = useState<any>(null)
  const [assetFilter, setAssetFilter] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [inspectorFilter, setInspectorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState(navigationFilters.status ?? '')
  const [shiftFilter, setShiftFilter] = useState('')
  const [showFilters, setShowFilters] = useState(Object.keys(navigationFilters).length > 0)
  const [viewingInspectionId, setViewingInspectionId] = useState<string | null>(selectedInspectionId)

  useEffect(() => {
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, [clearFilters, navigationFilters])

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

  const { data: inspectionsResponse = [], isLoading } = useQuery({
    queryKey: ['inspections', assetFilter, assetTypeFilter, inspectorFilter, dateFrom, dateTo, statusFilter, shiftFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (assetFilter) params.set('assetId', assetFilter)
      if (assetTypeFilter) params.set('assetType', assetTypeFilter)
      if (inspectorFilter) params.set('inspectorId', inspectorFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (statusFilter) params.set('status', statusFilter)
      if (shiftFilter) params.set('shift', shiftFilter)
      return fetch(`/api/inspections?${params}`).then(r => r.json())
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

  const inspections = Array.isArray(inspectionsResponse) ? inspectionsResponse : []
  const assets = Array.isArray(assetsResponse) ? assetsResponse : []
  const users = Array.isArray(usersResponse) ? usersResponse : []

  const hasActiveFilters = Boolean(assetFilter || assetTypeFilter || inspectorFilter || dateFrom || dateTo || statusFilter || shiftFilter)

  const clearAllFilters = () => {
    setAssetFilter('')
    setAssetTypeFilter('')
    setInspectorFilter('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setShiftFilter('')
  }

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
          <Select value={inspectorFilter} onValueChange={(v) => setInspectorFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="کارشناس بازدید" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه کارشناسان</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      ) : inspections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>بازدیدی ثبت نشده</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-background">
          <div className="hidden md:grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_0.9fr] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>دارایی</span>
            <span>نوع دارایی</span>
            <span>کارشناس</span>
            <span>شیفت</span>
            <span>تاریخ</span>
            <span className="text-left">وضعیت</span>
          </div>
          {inspections.map((insp: any) => (
            <button
              key={insp.id}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-3 text-right transition-colors last:border-b-0 hover:bg-muted/50 md:grid-cols-[1.8fr_1fr_1fr_1fr_1fr_0.9fr]"
              onClick={() => { setViewingInspectionId(insp.id); setStep('detail') }}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{insp.asset?.nameFa}</span>
                <span className="block truncate text-xs text-muted-foreground">{insp.asset?.assetCode}</span>
              </span>
              <span className="hidden text-sm text-muted-foreground md:block">{getAssetTypeLabel(insp.asset?.assetType)}</span>
              <span className="hidden truncate text-sm text-muted-foreground md:block">{insp.inspector?.name || '—'}</span>
              <span className="hidden text-sm text-muted-foreground md:block">{shiftLabels[insp.shift || ''] || '—'}</span>
              <span className="hidden text-sm text-muted-foreground md:block"><PersianDate date={insp.date} relative /></span>
              <span className="justify-self-end md:justify-self-start"><StatusBadge status={insp.status} /></span>
              <span className="col-span-2 text-xs text-muted-foreground md:hidden">
                {insp.inspector?.name || '—'} • <PersianDate date={insp.date} relative />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
