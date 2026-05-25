'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function FaultForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    assetId: '',
    faultType: 'mechanical',
    priority: 'medium',
    description: '',
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
    mutationFn: (data: any) => fetch('/api/faults', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faults'] })
      toast.success('خرابی با موفقیت ثبت شد')
      onClose()
    },
    onError: () => toast.error('خطا در ثبت خرابی'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const techUser = users.find((u: any) => u.role === 'technician')
    mutation.mutate({
      ...form,
      reportedById: techUser?.id || users[0]?.id,
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
          <Label>نوع خرابی</Label>
          <Select value={form.faultType} onValueChange={(v) => setForm({ ...form, faultType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="electrical">برقی</SelectItem>
              <SelectItem value="mechanical">مکانیکی</SelectItem>
              <SelectItem value="hydraulic">هیدرولیکی</SelectItem>
              <SelectItem value="control">کنترلی</SelectItem>
              <SelectItem value="leakage">نشتی</SelectItem>
              <SelectItem value="other">سایر</SelectItem>
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

      <div>
        <Label>شرح خرابی *</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="شرح خرابی..." required rows={4} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ثبت...' : 'ثبت خرابی'}
        </Button>
      </div>
    </form>
  )
}
