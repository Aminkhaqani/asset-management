'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber } from '@/lib/persian'
import { AlertTriangle, Fuel, Gauge, Plus, UserRound } from 'lucide-react'
import { toast } from 'sonner'

type FormType = 'odometer' | 'fuel' | 'driverAssignment' | 'incident'

type VehicleRecords = {
  odometerLogs: Array<{ id: string; readingKm: number; readingAt: string; recordedBy?: string | null; notes?: string | null }>
  fuelLogs: Array<{ id: string; fuelType?: string | null; liters: number; cost?: number | null; odometerKm?: number | null; station?: string | null; refueledAt: string }>
  driverAssignments: Array<{ id: string; driverName: string; driverCode?: string | null; driverPhone?: string | null; mission?: string | null; startAt: string; endAt?: string | null; status: string }>
  incidents: Array<{ id: string; type: string; occurredAt: string; driverName?: string | null; description: string; cost?: number | null; insuranceUsed: boolean; status: string }>
}

const emptyRecords: VehicleRecords = {
  odometerLogs: [],
  fuelLogs: [],
  driverAssignments: [],
  incidents: [],
}

const formTitles: Record<FormType, string> = {
  odometer: 'ثبت کیلومتر خودرو',
  fuel: 'ثبت سوخت',
  driverAssignment: 'تخصیص راننده',
  incident: 'ثبت حادثه/تخلف',
}

const fuelLabels: Record<string, string> = {
  gasoline: 'بنزین',
  diesel: 'گازوئیل',
  cng: 'گاز CNG',
  electric: 'برق',
  hybrid: 'هیبرید',
}

const incidentLabels: Record<string, string> = {
  accident: 'تصادف',
  violation: 'تخلف',
  damage: 'خسارت',
  claim: 'پرونده بیمه',
}

export function VehicleRecordsPanel({ assetId }: { assetId: string }) {
  const queryClient = useQueryClient()
  const [activeForm, setActiveForm] = useState<FormType | null>(null)
  const [odometerForm, setOdometerForm] = useState({ readingKm: '', readingAt: '', recordedBy: '', notes: '' })
  const [fuelForm, setFuelForm] = useState({ fuelType: 'gasoline', liters: '', cost: '', odometerKm: '', station: '', invoiceNumber: '', refueledAt: '', notes: '' })
  const [assignmentForm, setAssignmentForm] = useState({ driverName: '', driverCode: '', driverPhone: '', mission: '', startAt: '', endAt: '', notes: '' })
  const [incidentForm, setIncidentForm] = useState({ type: 'accident', occurredAt: '', driverName: '', description: '', cost: '', insuranceUsed: false, status: 'open', notes: '' })

  const { data = emptyRecords, isLoading } = useQuery<VehicleRecords>({
    queryKey: ['vehicle-records', assetId],
    queryFn: () => fetch(`/api/assets/${assetId}/vehicle-records`).then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      fetch(`/api/assets/${assetId}/vehicle-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records', assetId] })
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] })
      toast.success('رکورد خودرو ثبت شد')
      setActiveForm(null)
    },
    onError: () => toast.error('خطا در ثبت رکورد خودرو'),
  })

  const latestOdometer = data.odometerLogs[0]
  const latestFuel = data.fuelLogs[0]
  const activeAssignment = data.driverAssignments.find((assignment) => assignment.status === 'active')
  const openIncidents = data.incidents.filter((incident) => incident.status !== 'closed')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeForm === 'odometer') mutation.mutate({ recordType: activeForm, ...odometerForm })
    if (activeForm === 'fuel') mutation.mutate({ recordType: activeForm, ...fuelForm })
    if (activeForm === 'driverAssignment') mutation.mutate({ recordType: activeForm, ...assignmentForm })
    if (activeForm === 'incident') mutation.mutate({ recordType: activeForm, ...incidentForm })
  }

  const openForm = (type: FormType) => setActiveForm(type)

  if (isLoading) {
    return <div className="h-32 rounded-lg bg-muted animate-pulse" />
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <SummaryCard icon={<Gauge className="h-4 w-4" />} label="آخرین کیلومتر" value={latestOdometer ? `${toPersianNumber(latestOdometer.readingKm)} km` : 'ثبت نشده'} />
        <SummaryCard icon={<Fuel className="h-4 w-4" />} label="آخرین سوخت" value={latestFuel ? `${toPersianNumber(latestFuel.liters)} لیتر` : 'ثبت نشده'} />
        <SummaryCard icon={<UserRound className="h-4 w-4" />} label="راننده فعال" value={activeAssignment?.driverName || 'بدون تخصیص'} />
        <SummaryCard icon={<AlertTriangle className="h-4 w-4" />} label="حادثه/تخلف باز" value={`${toPersianNumber(openIncidents.length)} مورد`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => openForm('odometer')}><Plus className="h-4 w-4 ml-1" /> کیلومتر</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => openForm('fuel')}><Plus className="h-4 w-4 ml-1" /> سوخت</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => openForm('driverAssignment')}><Plus className="h-4 w-4 ml-1" /> راننده</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => openForm('incident')}><Plus className="h-4 w-4 ml-1" /> حادثه/تخلف</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <RecordSection title="کیلومترخوانی دستی">
          {data.odometerLogs.length === 0 ? <EmptyRow text="کیلومتری ثبت نشده" /> : data.odometerLogs.slice(0, 5).map((log) => (
            <Row key={log.id} title={`${toPersianNumber(log.readingKm)} کیلومتر`} meta={<PersianDate date={log.readingAt} />} detail={log.recordedBy || log.notes || undefined} />
          ))}
        </RecordSection>

        <RecordSection title="سوخت">
          {data.fuelLogs.length === 0 ? <EmptyRow text="سوختی ثبت نشده" /> : data.fuelLogs.slice(0, 5).map((log) => (
            <Row key={log.id} title={`${toPersianNumber(log.liters)} لیتر ${fuelLabels[log.fuelType || ''] || ''}`} meta={<PersianDate date={log.refueledAt} />} detail={log.cost ? `${toPersianNumber(log.cost.toLocaleString())} ریال` : log.station || undefined} />
          ))}
        </RecordSection>

        <RecordSection title="تخصیص راننده">
          {data.driverAssignments.length === 0 ? <EmptyRow text="راننده‌ای تخصیص داده نشده" /> : data.driverAssignments.slice(0, 5).map((assignment) => (
            <Row key={assignment.id} title={assignment.driverName} meta={assignment.status === 'active' ? <Badge>فعال</Badge> : <Badge variant="secondary">بسته شده</Badge>} detail={assignment.mission || assignment.driverPhone || undefined} />
          ))}
        </RecordSection>

        <RecordSection title="حادثه و تخلف">
          {data.incidents.length === 0 ? <EmptyRow text="حادثه یا تخلفی ثبت نشده" /> : data.incidents.slice(0, 5).map((incident) => (
            <Row key={incident.id} title={incident.description} meta={incidentLabels[incident.type] || incident.type} detail={incident.cost ? `${toPersianNumber(incident.cost.toLocaleString())} ریال` : incident.driverName || undefined} />
          ))}
        </RecordSection>
      </div>

      <Dialog open={!!activeForm} onOpenChange={(open) => !open && setActiveForm(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">{activeForm ? formTitles[activeForm] : ''}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeForm === 'odometer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="کیلومتر *"><Input type="number" value={odometerForm.readingKm} onChange={(e) => setOdometerForm({ ...odometerForm, readingKm: e.target.value })} required dir="ltr" /></Field>
                <Field label="تاریخ ثبت"><Input type="date" value={odometerForm.readingAt} onChange={(e) => setOdometerForm({ ...odometerForm, readingAt: e.target.value })} dir="ltr" /></Field>
                <Field label="ثبت‌کننده"><Input value={odometerForm.recordedBy} onChange={(e) => setOdometerForm({ ...odometerForm, recordedBy: e.target.value })} /></Field>
                <Field label="توضیحات"><Input value={odometerForm.notes} onChange={(e) => setOdometerForm({ ...odometerForm, notes: e.target.value })} /></Field>
              </div>
            )}

            {activeForm === 'fuel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="نوع سوخت"><Select value={fuelForm.fuelType} onValueChange={(value) => setFuelForm({ ...fuelForm, fuelType: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(fuelLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="مقدار *"><Input type="number" step="0.1" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} required dir="ltr" /></Field>
                <Field label="هزینه"><Input type="number" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} dir="ltr" /></Field>
                <Field label="کیلومتر"><Input type="number" value={fuelForm.odometerKm} onChange={(e) => setFuelForm({ ...fuelForm, odometerKm: e.target.value })} dir="ltr" /></Field>
                <Field label="جایگاه/تامین‌کننده"><Input value={fuelForm.station} onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })} /></Field>
                <Field label="تاریخ"><Input type="date" value={fuelForm.refueledAt} onChange={(e) => setFuelForm({ ...fuelForm, refueledAt: e.target.value })} dir="ltr" /></Field>
              </div>
            )}

            {activeForm === 'driverAssignment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="نام راننده *"><Input value={assignmentForm.driverName} onChange={(e) => setAssignmentForm({ ...assignmentForm, driverName: e.target.value })} required /></Field>
                <Field label="کد راننده"><Input value={assignmentForm.driverCode} onChange={(e) => setAssignmentForm({ ...assignmentForm, driverCode: e.target.value })} /></Field>
                <Field label="تلفن راننده"><Input value={assignmentForm.driverPhone} onChange={(e) => setAssignmentForm({ ...assignmentForm, driverPhone: e.target.value })} dir="ltr" /></Field>
                <Field label="شروع تحویل"><Input type="date" value={assignmentForm.startAt} onChange={(e) => setAssignmentForm({ ...assignmentForm, startAt: e.target.value })} dir="ltr" /></Field>
                <Field label="ماموریت"><Input value={assignmentForm.mission} onChange={(e) => setAssignmentForm({ ...assignmentForm, mission: e.target.value })} /></Field>
                <Field label="توضیحات"><Input value={assignmentForm.notes} onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })} /></Field>
              </div>
            )}

            {activeForm === 'incident' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="نوع"><Select value={incidentForm.type} onValueChange={(value) => setIncidentForm({ ...incidentForm, type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(incidentLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="تاریخ"><Input type="date" value={incidentForm.occurredAt} onChange={(e) => setIncidentForm({ ...incidentForm, occurredAt: e.target.value })} dir="ltr" /></Field>
                <Field label="راننده"><Input value={incidentForm.driverName} onChange={(e) => setIncidentForm({ ...incidentForm, driverName: e.target.value })} /></Field>
                <Field label="هزینه"><Input type="number" value={incidentForm.cost} onChange={(e) => setIncidentForm({ ...incidentForm, cost: e.target.value })} dir="ltr" /></Field>
                <div className="space-y-1.5 sm:col-span-2"><Label>شرح *</Label><Textarea value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} required /></div>
                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 sm:col-span-2"><Label>از بیمه استفاده شده</Label><Switch checked={incidentForm.insuranceUsed} onCheckedChange={(value) => setIncidentForm({ ...incidentForm, insuranceUsed: value })} /></div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setActiveForm(null)}>انصراف</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'در حال ثبت...' : 'ثبت'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/35 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">{icon}{label}</div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  )
}

function RecordSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  )
}

function Row({ title, meta, detail }: { title: string; meta: ReactNode; detail?: string }) {
  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium line-clamp-1">{title}</p>
        <span className="text-xs text-muted-foreground shrink-0">{meta}</span>
      </div>
      {detail && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{detail}</p>}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground py-5 text-center">{text}</p>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
