'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CriticalityBadge, PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, shiftLabels, faultTypeLabels, recurrenceLabels } from '@/lib/persian'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  Gauge,
  MapPin,
  QrCode,
  Settings,
  Tag,
  User,
  Wrench,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PMPlansList } from '@/components/maintenance/PMPlansList'
import { getAssetTypeDefinition } from '@/lib/asset-types'

type DetailRow = {
  key: string
  label: string
  value: unknown
  unit?: string
}

const ownershipTypeLabels: Record<string, string> = {
  owned: 'تملکی',
  leased: 'اجاره‌ای',
  contracted: 'قراردادی',
  borrowed: 'امانی',
}

const pmItemTypeLabels: Record<string, string> = {
  periodic_inspection: 'بازدید دوره‌ای',
  checklist: 'چک‌لیست',
  annual_overhaul: 'اورهال یک‌ساله',
  service: 'سرویس دوره‌ای',
  calibration: 'کالیبراسیون',
  safety_test: 'تست ایمنی',
}

const intervalUnitLabels: Record<string, string> = {
  day: 'روز',
  week: 'هفته',
  month: 'ماه',
  year: 'سال',
  running_hour: 'ساعت کارکرد',
}

function parseJson(value: unknown) {
  if (!value) return {}
  if (typeof value === 'object') return value as Record<string, any>
  if (typeof value !== 'string') return {}
  try { return JSON.parse(value) } catch { return {} }
}

function normalizeValue(value: unknown) {
  if (value === undefined || value === null || String(value).trim() === '') return null
  return String(value)
}

function DetailGrid({ rows, emptyText = 'اطلاعاتی ثبت نشده' }: { rows: DetailRow[]; emptyText?: string }) {
  const visibleRows = rows.filter((row) => normalizeValue(row.value))

  if (visibleRows.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">{emptyText}</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {visibleRows.map((row) => (
        <div key={row.key} className="rounded-lg bg-muted/35 p-3 text-sm">
          <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
          <p className="font-medium break-words">
            {String(row.value)}
            {row.unit ? ` ${row.unit}` : ''}
          </p>
        </div>
      ))}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

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
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-44 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!asset) return <div className="p-4 text-center">دارایی یافت نشد</div>

  const assetType = getAssetTypeDefinition(asset.assetType)
  const specs = parseJson(asset.specifications)
  const customFields = parseJson(asset.customFields)
  const identity = parseJson(customFields.identity)
  const assignment = parseJson(customFields.assignment)
  const pmSetup = parseJson(customFields.pm)
  const pmItems = Array.isArray(pmSetup.items) ? pmSetup.items : []

  const technicalRows: DetailRow[] = assetType.fields.map((field) => {
    const rawValue = customFields[field.key]
    const optionLabel = field.options?.find((option) => option.value === rawValue)?.label
    return {
      key: field.key,
      label: field.label,
      value: optionLabel || rawValue,
      unit: field.unit,
    }
  })

  const identityRows: DetailRow[] = assetType.identityFields.map((field) => {
    const rawValue = identity[field.key]
    const optionLabel = field.key === 'ownershipType'
      ? ownershipTypeLabels[String(rawValue)]
      : field.options?.find((option) => option.value === rawValue)?.label
    return {
      key: field.key,
      label: field.label,
      value: optionLabel || rawValue,
      unit: field.unit,
    }
  })

  const latestInspection = asset.inspections?.[0]
  const latestWorkOrder = asset.workOrders?.[0]
  const openFaults = (asset.faults || []).filter((fault: any) => ['open', 'in_progress'].includes(fault.status))
  const activeWorkOrders = (asset.workOrders || []).filter((wo: any) => ['pending', 'assigned', 'in_progress', 'overdue'].includes(wo.status))
  const activePmPlans = asset.pmPlans || []
  const assignedUserMap = Object.fromEntries((asset.assignedUsers || []).map((user: any) => [user.id, user.name]))

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('assets')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold truncate">{asset.nameFa}</h2>
            <StatusBadge status={asset.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {asset.assetCode} • {assetType.label} • {asset.category?.nameFa}
          </p>
        </div>
        <CriticalityBadge criticality={asset.criticality} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">وضعیت کلی دارایی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="rounded-lg bg-muted/35 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Activity className="h-3.5 w-3.5" />
                وضعیت
              </div>
              <StatusBadge status={asset.status} />
            </div>
            <div className="rounded-lg bg-muted/35 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <ClipboardCheck className="h-3.5 w-3.5" />
                آخرین بازدید
              </div>
              {latestInspection ? <PersianDate date={latestInspection.date} relative /> : <span className="text-sm font-medium">ثبت نشده</span>}
            </div>
            <div className="rounded-lg bg-muted/35 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                خرابی باز
              </div>
              <p className="text-sm font-medium">{toPersianNumber(openFaults.length)} مورد</p>
            </div>
            <div className="rounded-lg bg-muted/35 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Wrench className="h-3.5 w-3.5" />
                کار فعال
              </div>
              <p className="text-sm font-medium">{toPersianNumber(activeWorkOrders.length)} دستورکار</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">مکان فعلی</p>
              <p className="font-medium">{asset.location?.name || '—'}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">آخرین دستورکار</p>
              <p className="font-medium truncate">{latestWorkOrder?.title || 'ثبت نشده'}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">PM فعال</p>
              <p className="font-medium">{toPersianNumber(activePmPlans.length)} برنامه</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1">
          <TabsTrigger value="summary" className="min-w-24">پرونده</TabsTrigger>
          <TabsTrigger value="identity" className="min-w-28">هویتی/مالکیت</TabsTrigger>
          <TabsTrigger value="technical" className="min-w-24">فنی</TabsTrigger>
          <TabsTrigger value="assignment" className="min-w-28">تخصیص/مکان</TabsTrigger>
          <TabsTrigger value="pm" className="min-w-24">PM</TabsTrigger>
          <TabsTrigger value="inspections" className="min-w-24">بازدیدها</TabsTrigger>
          <TabsTrigger value="workorders" className="min-w-24">تعمیرات</TabsTrigger>
          <TabsTrigger value="faults" className="min-w-24">خرابی‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-3">
          <SectionCard title="مشخصات اصلی دارایی">
            <DetailGrid rows={[
              { key: 'assetCode', label: 'کد دارایی', value: asset.assetCode },
              { key: 'nameFa', label: 'نام فارسی', value: asset.nameFa },
              { key: 'nameEn', label: 'نام انگلیسی', value: asset.nameEn },
              { key: 'assetType', label: 'نوع دارایی', value: assetType.label },
              { key: 'category', label: 'دسته‌بندی', value: asset.category?.nameFa },
              { key: 'criticality', label: 'اهمیت', value: asset.criticality },
              { key: 'status', label: 'وضعیت', value: asset.status },
              { key: 'qrCode', label: 'کد QR', value: asset.qrCode },
            ]} />
          </SectionCard>

          <SectionCard title="شناسه و QR">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="font-mono" dir="ltr">{asset.qrCode}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <QrCode className="h-4 w-4" />
                کد QR برای شناسایی سریع دارایی
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="identity" className="space-y-3">
          <SectionCard title="اطلاعات هویتی و مالکیت">
            <DetailGrid rows={identityRows} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="technical" className="space-y-3">
          <SectionCard title="مشخصات عمومی فنی">
            <DetailGrid rows={[
              { key: 'brand', label: 'برند', value: asset.brand },
              { key: 'model', label: 'مدل', value: asset.model },
              { key: 'serialNumber', label: 'شماره سریال', value: asset.serialNumber },
              { key: 'capacity', label: 'ظرفیت عمومی', value: asset.capacity },
            ]} />
          </SectionCard>
          <SectionCard title={`مشخصات فنی اختصاصی ${assetType.label}`}>
            <DetailGrid rows={technicalRows} />
          </SectionCard>
          {Object.keys(specs).length > 0 && (
            <SectionCard title="مشخصات فنی آزاد">
              <DetailGrid rows={Object.entries(specs).map(([key, value]) => ({ key, label: key, value }))} />
            </SectionCard>
          )}
        </TabsContent>

        <TabsContent value="assignment" className="space-y-3">
          <SectionCard title="تخصیص، مکان و بهره‌برداری">
            <DetailGrid rows={[
              { key: 'location', label: 'مکان', value: asset.location?.name },
              { key: 'floor', label: 'طبقه', value: asset.location?.floor },
              { key: 'zone', label: 'زون', value: asset.location?.zone },
              { key: 'building', label: 'ساختمان', value: asset.location?.building },
              { key: 'operationalUnit', label: 'واحد بهره‌بردار', value: assignment.operationalUnit },
              { key: 'custodian', label: 'امین اموال/تحویل‌گیرنده', value: assignment.custodian },
              { key: 'primaryExpert', label: 'کارشناس مسئول', value: assignedUserMap[assignment.primaryExpertId] || assignment.primaryExpertId },
              { key: 'maintenanceOwner', label: 'مسئول تعمیرات', value: assignedUserMap[assignment.maintenanceOwnerId] || assignment.maintenanceOwnerId },
              { key: 'inspectionOwner', label: 'مسئول بازدید', value: assignedUserMap[assignment.inspectionOwnerId] || assignment.inspectionOwnerId },
            ]} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="pm" className="space-y-3">
          <SectionCard title="آیتم‌های PM تعریف‌شده در کارت دارایی">
            {pmItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">آیتم PM در کارت دارایی ثبت نشده</p>
            ) : (
              <div className="space-y-2">
                {pmItems.map((item: any, index: number) => (
                  <div key={item.id || index} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{item.title || `آیتم ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{pmItemTypeLabels[item.type] || item.type}</p>
                      </div>
                      {item.intervalValue && (
                        <Badge variant="outline">
                          هر {toPersianNumber(item.intervalValue)} {intervalUnitLabels[item.intervalUnit] || item.intervalUnit}
                        </Badge>
                      )}
                    </div>
                    {item.owner && <p className="text-xs text-muted-foreground mt-2">مسئول: {item.owner}</p>}
                    {item.description && <p className="text-sm mt-2">{item.description}</p>}
                    {item.checklist && (
                      <div className="mt-2 text-xs text-muted-foreground whitespace-pre-line">{item.checklist}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
          <PMPlansList assetId={asset.id} showGenerate={false} />
        </TabsContent>

        <TabsContent value="inspections" className="space-y-3">
          {asset.inspections.length === 0 ? (
            <SectionCard title="بازدیدها"><p className="text-sm text-muted-foreground py-6 text-center">بازدیدی ثبت نشده</p></SectionCard>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_0.8fr] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>شیفت</span>
                <span>کارشناس</span>
                <span>تاریخ</span>
                <span>وضعیت</span>
              </div>
              {asset.inspections.map((insp: any) => (
                <button
                  key={insp.id}
                  onClick={() => navigate('inspections', { inspectionId: insp.id })}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-3 text-right last:border-b-0 hover:bg-muted/50 md:grid-cols-[1fr_1fr_1fr_0.8fr]"
                >
                  <span className="text-sm font-medium">{shiftLabels[insp.shift || ''] || insp.shift || '—'}</span>
                  <span className="hidden text-sm text-muted-foreground md:block">{insp.inspector?.name || '—'}</span>
                  <span className="hidden text-sm text-muted-foreground md:block"><PersianDate date={insp.date} relative /></span>
                  <span className="justify-self-end md:justify-self-start"><StatusBadge status={insp.status} /></span>
                  <span className="col-span-2 text-xs text-muted-foreground md:hidden">
                    {insp.inspector?.name || '—'} • <PersianDate date={insp.date} relative />
                  </span>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workorders" className="space-y-3">
          {asset.workOrders.length === 0 ? (
            <SectionCard title="تعمیرات"><p className="text-sm text-muted-foreground py-6 text-center">دستورکاری ثبت نشده</p></SectionCard>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.8fr] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>عنوان</span>
                <span>نوع</span>
                <span>کارشناس</span>
                <span>وضعیت</span>
              </div>
              {asset.workOrders.map((wo: any) => (
                <button
                  key={wo.id}
                  onClick={() => navigate('work-order-detail', { workOrderId: wo.id })}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-3 text-right last:border-b-0 hover:bg-muted/50 md:grid-cols-[2fr_1fr_1fr_0.8fr]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{wo.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{wo.recurrence ? recurrenceLabels[wo.recurrence] : ''}</span>
                  </span>
                  <span className="hidden text-sm text-muted-foreground md:block">{wo.type === 'preventive' ? 'پیشگیرانه' : 'اصلاحی'}</span>
                  <span className="hidden text-sm text-muted-foreground md:block">{wo.assignedTo?.name || 'بدون تخصیص'}</span>
                  <span className="justify-self-end md:justify-self-start"><StatusBadge status={wo.status} /></span>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faults" className="space-y-3">
          {asset.faults.length === 0 ? (
            <SectionCard title="خرابی‌ها"><p className="text-sm text-muted-foreground py-6 text-center">خرابی ثبت نشده</p></SectionCard>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.8fr] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>شرح</span>
                <span>نوع</span>
                <span>گزارش‌دهنده</span>
                <span>وضعیت</span>
              </div>
              {asset.faults.map((fault: any) => (
                <button
                  key={fault.id}
                  onClick={() => navigate('fault-detail', { faultId: fault.id })}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-3 text-right last:border-b-0 hover:bg-muted/50 md:grid-cols-[2fr_1fr_1fr_0.8fr]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{fault.description}</span>
                    <span className="block text-xs text-muted-foreground"><PersianDate date={fault.reportedAt} relative /></span>
                  </span>
                  <span className="hidden text-sm text-muted-foreground md:block">{faultTypeLabels[fault.faultType] || fault.faultType}</span>
                  <span className="hidden text-sm text-muted-foreground md:block">{fault.reportedBy?.name || '—'}</span>
                  <span className="flex flex-col items-end gap-1 md:items-start">
                    <PriorityBadge priority={fault.priority} />
                    <StatusBadge status={fault.status} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {asset.notes && (
        <SectionCard title="یادداشت‌ها">
          <p className="text-sm">{asset.notes}</p>
        </SectionCard>
      )}
    </div>
  )
}
