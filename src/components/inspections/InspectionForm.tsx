'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CriticalityBadge } from '@/components/shared/PriorityBadge'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

const faultAlarmOptions = [
  { id: 'high_temp', label: 'دمای بالا' },
  { id: 'low_pressure', label: 'فشار پایین' },
  { id: 'overheat', label: 'گرمایش بیش از حد' },
  { id: 'leakage', label: 'نشتی' },
  { id: 'low_oil', label: 'سطح روغن پایین' },
  { id: 'vibration', label: 'لرزش غیرطبیعی' },
  { id: 'overcurrent', label: 'جریان بیش از حد' },
  { id: 'phase_loss', label: 'قطع فاز' },
]

interface InspectionFormProps {
  asset: any
  onClose: () => void
}

export function InspectionForm({ asset, onClose }: InspectionFormProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    assetId: asset.id,
    shift: 'morning',
    status: 'normal',
    runningHours: '',
    oilLevel: 'normal',
    vibration: 'normal',
    noise: 'normal',
    faultAlarms: [] as string[],
    notes: '',
    temperature: '',
    pressure: '',
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => {
      if (!r.ok) throw new Error('Failed')
      return r.json()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      toast.success('بازدید با موفقیت ثبت شد')
      onClose()
    },
    onError: () => toast.error('خطا در ثبت بازدید'),
  })

  const toggleAlarm = (id: string) => {
    setForm(f => ({
      ...f,
      faultAlarms: f.faultAlarms.includes(id) ? f.faultAlarms.filter(a => a !== id) : [...f.faultAlarms, id]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const techUser = users.find((u: any) => u.role === 'technician')
    mutation.mutate({
      assetId: form.assetId,
      inspectorId: techUser?.id || users[0]?.id,
      shift: form.shift,
      status: form.status,
      runningHours: form.runningHours ? parseFloat(form.runningHours) : null,
      oilLevel: form.oilLevel,
      vibration: form.vibration,
      noise: form.noise,
      faultAlarms: JSON.stringify(form.faultAlarms),
      notes: form.notes,
      readings: JSON.stringify({
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        pressure: form.pressure ? parseFloat(form.pressure) : null,
      }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Read-only scanned asset info card */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">تجهیز اسکن‌شده</span>
          </div>

          <div className="bg-background rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm">{asset.nameFa}</p>
                <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                  {asset.assetCode} | {asset.qrCode}
                </p>
              </div>
              <StatusBadge status={asset.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t">
              <div>
                <span className="text-muted-foreground">دسته‌بندی: </span>
                <span className="font-medium">{asset.category?.nameFa || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">مکان: </span>
                <span className="font-medium">{asset.location?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">اهمیت: </span>
                <CriticalityBadge criticality={asset.criticality} />
              </div>
              <div>
                <span className="text-muted-foreground">مدل: </span>
                <span className="font-medium">{asset.model || '—'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">شیفت</Label>
          <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">صبحی</SelectItem>
              <SelectItem value="afternoon">عصر</SelectItem>
              <SelectItem value="night">شب</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">وضعیت کلی</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">عادی</SelectItem>
              <SelectItem value="warning">هشدار</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">دمای (°C)</Label>
          <Input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="دمای فعلی" dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">فشار (bar)</Label>
          <Input type="number" value={form.pressure} onChange={(e) => setForm({ ...form, pressure: e.target.value })} placeholder="فشار فعلی" dir="ltr" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">ساعت کارکرد</Label>
        <Input type="number" value={form.runningHours} onChange={(e) => setForm({ ...form, runningHours: e.target.value })} placeholder="ساعت کارکرد" dir="ltr" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">سطح روغن</Label>
          <Select value={form.oilLevel} onValueChange={(v) => setForm({ ...form, oilLevel: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">نرمال</SelectItem>
              <SelectItem value="low">پایین</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">لرزش</Label>
          <Select value={form.vibration} onValueChange={(v) => setForm({ ...form, vibration: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">نرمال</SelectItem>
              <SelectItem value="abnormal">غیرطبیعی</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">صدا</Label>
          <Select value={form.noise} onValueChange={(v) => setForm({ ...form, noise: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">نرمال</SelectItem>
              <SelectItem value="abnormal">غیرطبیعی</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">آلارم‌های خرابی</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {faultAlarmOptions.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={form.faultAlarms.includes(opt.id)}
                onCheckedChange={() => toggleAlarm(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">توضیحات</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات بازدید..." />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t mt-4">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending || !form.assetId}>
          {mutation.isPending ? 'در حال ثبت...' : 'ثبت بازدید'}
        </Button>
      </div>
    </form>
  )
}
