'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

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

export function InspectionForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    assetId: '',
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

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then(r => r.json()),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>تجهیز *</Label>
        <Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })} required>
          <SelectTrigger><SelectValue placeholder="انتخاب تجهیز" /></SelectTrigger>
          <SelectContent>
            {assets.map((a: any) => (
              <SelectItem key={a.id} value={a.id}>{a.assetCode} - {a.nameFa}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>شیفت</Label>
          <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">صبحی</SelectItem>
              <SelectItem value="afternoon">عصر</SelectItem>
              <SelectItem value="night">شب</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>وضعیت کلی</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>دمار (°C)</Label>
          <Input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="دمای فعلی" dir="ltr" />
        </div>
        <div>
          <Label>فشار (bar)</Label>
          <Input type="number" value={form.pressure} onChange={(e) => setForm({ ...form, pressure: e.target.value })} placeholder="فشار فعلی" dir="ltr" />
        </div>
      </div>

      <div>
        <Label>ساعت کارکرد</Label>
        <Input type="number" value={form.runningHours} onChange={(e) => setForm({ ...form, runningHours: e.target.value })} placeholder="ساعت کارکرد" dir="ltr" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>سطح روغن</Label>
          <Select value={form.oilLevel} onValueChange={(v) => setForm({ ...form, oilLevel: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">نرمال</SelectItem>
              <SelectItem value="low">پایین</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>لرزش</Label>
          <Select value={form.vibration} onValueChange={(v) => setForm({ ...form, vibration: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">نرمال</SelectItem>
              <SelectItem value="abnormal">غیرطبیعی</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>صدا</Label>
          <Select value={form.noise} onValueChange={(v) => setForm({ ...form, noise: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">نرمال</SelectItem>
              <SelectItem value="abnormal">غیرطبیعی</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>آلارم‌های خرابی</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
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

      <div>
        <Label>توضیحات</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات بازدید..." />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ثبت...' : 'ثبت بازدید'}
        </Button>
      </div>
    </form>
  )
}
