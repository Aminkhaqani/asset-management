'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { repairTypeLabels } from '@/lib/persian'

interface WorkOrderFormProps {
  type: 'preventive' | 'corrective'
  onClose: () => void
}

export function WorkOrderForm({ type, onClose }: WorkOrderFormProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'medium',
    assignedToId: '',
    scheduledDate: '',
    recurrence: '',
    notes: '',
    repairType: 'internal',
    workshopId: '',
    workshopCost: '',
    workshopInvoiceNumber: '',
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetch('/api/assets').then(r => r.json()),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const { data: faults = [] } = useQuery({
    queryKey: ['faults-open'],
    queryFn: () => fetch('/api/faults?status=open').then(r => r.json()),
    enabled: type === 'corrective',
  })

  const { data: workshops = [] } = useQuery({
    queryKey: ['workshops-active'],
    queryFn: () => fetch('/api/workshops?isActive=true').then(r => r.json()),
    enabled: form.repairType === 'external',
  })

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/work-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      toast.success('دستور کار با موفقیت ایجاد شد')
      onClose()
    },
    onError: () => toast.error('خطا در ایجاد دستور کار'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = {
      type,
      assetId: form.assetId,
      title: form.title,
      description: form.description,
      priority: form.priority,
      assignedToId: form.assignedToId || undefined,
      notes: form.notes,
      repairType: form.repairType,
    }
    if (form.scheduledDate) {
      data.scheduledDate = new Date(form.scheduledDate).toISOString()
    }
    if (type === 'preventive' && form.recurrence) {
      data.recurrence = form.recurrence
      data.nextDueDate = data.scheduledDate
    }
    if (form.repairType === 'external') {
      data.workshopId = form.workshopId || undefined
      data.workshopCost = form.workshopCost ? parseFloat(form.workshopCost) : undefined
      data.workshopInvoiceNumber = form.workshopInvoiceNumber || undefined
      if (form.workshopId) {
        data.sentToWorkshopAt = new Date().toISOString()
      }
    }
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>عنوان دستور کار *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان دستور کار" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <Label>اولویت</Label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">کم</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="high">زیاد</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>تکنسین مسئول</Label>
          <Select value={form.assignedToId} onValueChange={(v) => setForm({ ...form, assignedToId: v })}>
            <SelectTrigger><SelectValue placeholder="انتخاب تکنسین" /></SelectTrigger>
            <SelectContent>
              {users.filter((u: any) => u.role === 'technician' || u.role === 'supervisor').map((u: any) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>تاریخ برنامه‌ریزی</Label>
          <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} dir="ltr" />
        </div>
      </div>

      {/* Repair Type Selection */}
      <div>
        <Label>نوع تعمیر</Label>
        <Select value={form.repairType} onValueChange={(v) => setForm({ ...form, repairType: v, workshopId: '' })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(repairTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Workshop Fields - only shown when repairType is external */}
      {form.repairType === 'external' && (
        <div className="space-y-4 p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">اطلاعات تعمیرگاه خارجی</p>
          <div>
            <Label>تعمیرگاه *</Label>
            <Select value={form.workshopId} onValueChange={(v) => setForm({ ...form, workshopId: v })}>
              <SelectTrigger><SelectValue placeholder="انتخاب تعمیرگاه" /></SelectTrigger>
              <SelectContent>
                {workshops.map((ws: any) => (
                  <SelectItem key={ws.id} value={ws.id}>{ws.name} ({ws.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>هزینه تعمیرگاه</Label>
              <Input
                type="number"
                value={form.workshopCost}
                onChange={(e) => setForm({ ...form, workshopCost: e.target.value })}
                placeholder="مبلغ به ریال"
                dir="ltr"
              />
            </div>
            <div>
              <Label>شماره فاکتور</Label>
              <Input
                value={form.workshopInvoiceNumber}
                onChange={(e) => setForm({ ...form, workshopInvoiceNumber: e.target.value })}
                placeholder="شماره فاکتور"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      )}

      {type === 'preventive' && (
        <div>
          <Label>دوره تکرار</Label>
          <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v })}>
            <SelectTrigger><SelectValue placeholder="بدون تکرار" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">روزانه</SelectItem>
              <SelectItem value="weekly">هفتگی</SelectItem>
              <SelectItem value="monthly">ماهانه</SelectItem>
              <SelectItem value="quarterly">فصلی</SelectItem>
              <SelectItem value="yearly">سالانه</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>شرح کار</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="شرح دستور کار..." />
      </div>

      <div>
        <Label>توضیحات</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات اضافی..." />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ایجاد...' : 'ایجاد دستور کار'}
        </Button>
      </div>
    </form>
  )
}
