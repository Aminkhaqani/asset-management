'use client'

import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CriticalityBadge } from '@/components/shared/PriorityBadge'
import { useAppStore } from '@/store/useAppStore'
import { HardHat, MapPin } from 'lucide-react'
import { toPersianNumber } from '@/lib/persian'

interface AssetCardProps {
  asset: {
    id: string
    assetCode: string
    nameFa: string
    status: string
    criticality: string
    category: { nameFa: string; color?: string | null }
    location: { name: string; floor?: string | null }
    _count: { faults: number; workOrders: number }
  }
}

export function AssetCard({ asset }: AssetCardProps) {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <Card
      className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('asset-detail', { assetId: asset.id })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: (asset.category.color || '#0d9488') + '20' }}
            >
              <HardHat className="h-5 w-5" style={{ color: asset.category.color || '#0d9488' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{asset.nameFa}</p>
              <p className="text-xs text-muted-foreground">{asset.assetCode} • {asset.category.nameFa}</p>
            </div>
          </div>
          <StatusBadge status={asset.status} />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{asset.location.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <CriticalityBadge criticality={asset.criticality} />
            {asset._count.faults > 0 && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                {toPersianNumber(asset._count.faults)} خرابی
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
