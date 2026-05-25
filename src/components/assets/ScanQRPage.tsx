'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScanLine, Search, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function ScanQRPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [code, setCode] = useState('')

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then(r => r.json()),
  })

  const handleScan = () => {
    const found = assets.find((a: any) => a.qrCode === code || a.assetCode === code)
    if (found) {
      navigate('asset-detail', { assetId: found.id })
    } else {
      toast.error('دارایی با این کد یافت نشد')
    }
  }

  const handleQuickSelect = (asset: any) => {
    navigate('asset-detail', { assetId: asset.id })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">اسکن QR / جستجوی سریع</h2>

      {/* QR Code Input */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
              <ScanLine className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-sm text-muted-foreground">کد QR یا کد دارایی را وارد کنید</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثلا: QR-CH-001 یا CH-001"
              dir="ltr"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
            <Button onClick={handleScan} disabled={!code}>
              <Search className="h-4 w-4 ml-1" />
              جستجو
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Asset Selection */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">انتخاب سریع دارایی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {assets.map((asset: any) => (
              <button
                key={asset.id}
                onClick={() => handleQuickSelect(asset)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors text-right"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{asset.nameFa}</p>
                  <p className="text-xs text-muted-foreground">{asset.assetCode} • {asset.qrCode}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 rotate-180" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
