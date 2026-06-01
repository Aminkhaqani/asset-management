'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScanLine, Search, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CriticalityBadge } from '@/components/shared/PriorityBadge'
import { toPersianNumber } from '@/lib/persian'

interface AssetQRScannerProps {
  onAssetFound: (asset: any) => void
  onContinue?: () => void
  title?: string
  description?: string
}

export function AssetQRScanner({
  onAssetFound,
  onContinue,
  title = 'اسکن کد تجهیز',
  description = 'برای ثبت بازدید، ابتدا کد QR نصب‌شده روی تجهیز را اسکن کنید.',
}: AssetQRScannerProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [foundAsset, setFoundAsset] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError(null)
    setFoundAsset(null)

    try {
      const res = await fetch(`/api/assets/lookup?code=${encodeURIComponent(code.trim())}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('تجهیزی با این کد پیدا نشد')
        } else {
          const data = await res.json()
          setError(data.error || 'خطا در جستجوی تجهیز')
        }
        return
      }

      const asset = await res.json()
      setFoundAsset(asset)
      onAssetFound(asset)
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
          <ScanLine className="h-10 w-10 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <Label>کد تجهیز</Label>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="کد دارایی یا QR را وارد کنید"
            dir="ltr"
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={!code.trim() || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Search className="h-4 w-4 ml-1" />
            )}
            جستجوی تجهیز
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Found Asset Card */}
      {foundAsset && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">تجهیز یافت شد</span>
            </div>

            <div className="bg-background rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{foundAsset.nameFa}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                    {foundAsset.assetCode} | {foundAsset.qrCode}
                  </p>
                </div>
                <StatusBadge status={foundAsset.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                <div>
                  <span className="text-muted-foreground">دسته‌بندی: </span>
                  <span className="font-medium">{foundAsset.category?.nameFa || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">مکان: </span>
                  <span className="font-medium">{foundAsset.location?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">اهمیت: </span>
                  <CriticalityBadge criticality={foundAsset.criticality} />
                </div>
                <div>
                  <span className="text-muted-foreground">مدل: </span>
                  <span className="font-medium">{foundAsset.model || '—'}</span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              className="w-full"
              onClick={onContinue}
            >
              ادامه
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
