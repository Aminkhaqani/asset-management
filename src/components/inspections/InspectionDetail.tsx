'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { shiftLabels, oilLevelLabels, vibrationLabels, noiseLabels, statusLabels } from '@/lib/persian'
import { ArrowRight, ClipboardCheck, Thermometer, Gauge, Clock, User, AlertTriangle, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InspectionDetailProps {
  inspectionId: string
  onBack: () => void
}

export function InspectionDetail({ inspectionId, onBack }: InspectionDetailProps) {
  const navigate = useAppStore((s) => s.navigate)

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', inspectionId],
    queryFn: () => fetch(`/api/inspections/${inspectionId}`).then(r => r.json()),
    enabled: !!inspectionId,
  })

  if (isLoading) return <div className="p-4 space-y-4"><div className="h-40 rounded-xl bg-muted animate-pulse" /></div>
  if (!inspection) return <div className="p-4 text-center">بازدید یافت نشد</div>

  const faultAlarms = inspection.faultAlarms ? JSON.parse(inspection.faultAlarms) : []
  const readings = inspection.readings ? JSON.parse(inspection.readings) : {}

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">جزئیات بازدید</h2>
          <p className="text-sm text-muted-foreground">{inspection.asset?.nameFa} • {inspection.asset?.assetCode}</p>
        </div>
        <StatusBadge status={inspection.status} />
      </div>

      {/* Asset Info - Clickable */}
      <Card
        className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('asset-detail', { assetId: inspection.assetId })}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{inspection.asset?.nameFa}</p>
              <p className="text-xs text-muted-foreground">{inspection.asset?.assetCode}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
          </div>
        </CardContent>
      </Card>

      {/* Inspection Details */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">بازرس:</span>
              <span className="font-medium">{inspection.inspector?.name || '—'}</span>
            </div>
            <Badge variant="outline">{shiftLabels[inspection.shift] || '—'}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">تاریخ:</span>
            <PersianDate date={inspection.date} time />
          </div>
        </CardContent>
      </Card>

      {/* Readings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            مقادیر قرائت‌شده
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Thermometer className="h-3.5 w-3.5" />
                دمای (°C)
              </div>
              <p className="text-sm font-medium">{readings.temperature ?? '—'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Gauge className="h-3.5 w-3.5" />
                فشار (bar)
              </div>
              <p className="text-sm font-medium">{readings.pressure ?? '—'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">ساعت کارکرد</div>
              <p className="text-sm font-medium">{inspection.runningHours ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Checks */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">بررسی وضعیت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: 'سطح روغن', value: oilLevelLabels[inspection.oilLevel] || inspection.oilLevel },
              { label: 'لرزش', value: vibrationLabels[inspection.vibration] || inspection.vibration },
              { label: 'صدا', value: noiseLabels[inspection.noise] || inspection.noise },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fault Alarms */}
      {faultAlarms.length > 0 && (
        <Card className="border-0 shadow-sm border-r-4 border-r-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              آلارم‌های خرابی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {faultAlarms.map((alarm: string) => (
                <Badge key={alarm} variant="destructive" className="text-xs">
                  {alarm}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {inspection.notes && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">توضیحات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{inspection.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
