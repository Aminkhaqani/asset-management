'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { shiftLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Plus, ClipboardCheck, ArrowRight } from 'lucide-react'
import { InspectionForm } from './InspectionForm'
import { AssetQRScanner } from '@/components/shared/AssetQRScanner'
import { useState } from 'react'

type InspectionStep = 'list' | 'scan' | 'form'

export function InspectionList() {
  const [step, setStep] = useState<InspectionStep>('list')
  const [scannedAsset, setScannedAsset] = useState<any>(null)

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => fetch('/api/inspections').then(r => r.json()),
  })

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
    }
  }

  const handleClose = () => {
    setStep('list')
    setScannedAsset(null)
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
            <Card key={insp.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
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
