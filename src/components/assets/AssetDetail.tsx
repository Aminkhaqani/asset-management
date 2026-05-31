'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CriticalityBadge, PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, shiftLabels, faultTypeLabels, statusLabels, roleLabels } from '@/lib/persian'
import { 
  ArrowRight, MapPin, Tag, Calendar, QrCode, FileText, Clock, 
  AlertTriangle, Wrench, ClipboardCheck, HardHat, Activity, Settings
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PMPlansList } from '@/components/maintenance/PMPlansList'

export function AssetDetail() {
  const { selectedAssetId, navigate } = useAppStore()

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', selectedAssetId],
    queryFn: () => fetch(`/api/assets/${selectedAssetId}`).then(r => r.json()),
    enabled: !!selectedAssetId,
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-20 rounded-xl bg-muted animate-pulse" />
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!asset) return <div className="p-4 text-center">دارایی یافت نشد</div>

  const parseJson = (str: string | null | undefined) => {
    if (!str) return {}
    try { return JSON.parse(str) } catch { return {} }
  }

  const specs = parseJson(asset.specifications)

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('assets')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{asset.nameFa}</h2>
          <p className="text-sm text-muted-foreground">{asset.assetCode}</p>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      {/* Basic Info Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">دسته‌بندی:</span>
              <span className="font-medium">{asset.category?.nameFa}</span>
            </div>
            <CriticalityBadge criticality={asset.criticality} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">مکان:</span>
            <span className="font-medium">{asset.location?.name}</span>
            {asset.location?.floor && <Badge variant="outline" className="text-xs">طبقه {asset.location.floor}</Badge>}
          </div>
          {asset.brand && (
            <div className="flex items-center gap-2 text-sm">
              <HardHat className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">برند/مدل:</span>
              <span className="font-medium">{asset.brand} {asset.model}</span>
            </div>
          )}
          {asset.serialNumber && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">سریال:</span>
              <span className="font-medium font-mono" dir="ltr">{asset.serialNumber}</span>
            </div>
          )}
          {asset.capacity && (
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ظرفیت:</span>
              <span className="font-medium">{asset.capacity}</span>
            </div>
          )}
          {asset.installDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">تاریخ نصب:</span>
              <PersianDate date={asset.installDate} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-medium">کد QR: {asset.qrCode}</span>
          </div>
          <Badge variant="outline" className="font-mono" dir="ltr">{asset.qrCode}</Badge>
        </CardContent>
      </Card>

      {/* Technical Specs */}
      {Object.keys(specs).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">مشخصات فنی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-muted-foreground">{key}: </span>
                  <span className="font-medium" dir="ltr">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for details */}
      <Tabs defaultValue="timeline">
        <TabsList className="w-full">
          <TabsTrigger value="timeline" className="flex-1 text-xs">
            <Clock className="h-3.5 w-3.5 ml-1" />
            تاریخچه
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex-1 text-xs">
            <ClipboardCheck className="h-3.5 w-3.5 ml-1" />
            بازدیدها
          </TabsTrigger>
          <TabsTrigger value="faults" className="flex-1 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 ml-1" />
            خرابی‌ها
          </TabsTrigger>
          <TabsTrigger value="workorders" className="flex-1 text-xs">
            <Wrench className="h-3.5 w-3.5 ml-1" />
            دستورات
          </TabsTrigger>
          <TabsTrigger value="pm" className="flex-1 text-xs">
            <Settings className="h-3.5 w-3.5 ml-1" />
            PM دوره‌ای
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {asset.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">رویدادی ثبت نشده</p>
              ) : (
                <div className="space-y-3">
                  {asset.timeline.map((event: any) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                        <div className="flex items-center gap-2 mt-0.5">
                          {event.performedBy && <span className="text-xs text-muted-foreground">{event.performedBy}</span>}
                          <PersianDate date={event.eventDate} relative />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {asset.inspections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">بازدیدی ثبت نشده</p>
              ) : (
                <div className="space-y-3">
                  {asset.inspections.map((insp: any) => (
                    <div key={insp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{shiftLabels[insp.shift || ''] || insp.shift}</p>
                        <p className="text-xs text-muted-foreground">{insp.inspector?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PersianDate date={insp.date} />
                        <StatusBadge status={insp.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faults" className="mt-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {asset.faults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">خرابی ثبت نشده</p>
              ) : (
                <div className="space-y-3">
                  {asset.faults.map((fault: any) => (
                    <button
                      key={fault.id}
                      onClick={() => navigate('fault-detail', { faultId: fault.id })}
                      className="w-full text-right flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{fault.description}</p>
                        <p className="text-xs text-muted-foreground">{faultTypeLabels[fault.faultType] || fault.faultType} • {fault.reportedBy?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={fault.priority} />
                        <StatusBadge status={fault.status} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders" className="mt-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {asset.workOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">دستور کاری ثبت نشده</p>
              ) : (
                <div className="space-y-3">
                  {asset.workOrders.map((wo: any) => (
                    <button
                      key={wo.id}
                      onClick={() => navigate('work-order-detail', { workOrderId: wo.id })}
                      className="w-full text-right flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{wo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {wo.type === 'preventive' ? 'نگهداری پیشگیرانه' : 'تعمیرات اصلاحی'}
                          {wo.assignedTo && ` • ${wo.assignedTo.name}`}
                        </p>
                      </div>
                      <StatusBadge status={wo.status} />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pm" className="mt-3">
          <PMPlansList assetId={asset.id} showGenerate={false} />
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {asset.notes && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">یادداشت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{asset.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
