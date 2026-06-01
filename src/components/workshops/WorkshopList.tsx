'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Search, Plus, Building2, Phone, MapPin, User, Wrench, ToggleLeft, ToggleRight, Trash2, Edit, Loader2 } from 'lucide-react'
import { toPersianNumber, workshopSpecialtyLabels, formatPersianDate } from '@/lib/persian'
import { toast } from 'sonner'

interface Workshop {
  id: string
  name: string
  code: string
  phone: string | null
  address: string | null
  contactPerson: string | null
  specialty: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
  _count?: { workOrders: number }
}

const emptyForm = {
  name: '',
  code: '',
  phone: '',
  address: '',
  contactPerson: '',
  specialty: '',
  isActive: true,
  notes: '',
}

export function WorkshopList() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<string>('')
  const [filterSpecialty, setFilterSpecialty] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ['workshops', search, filterActive, filterSpecialty],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterActive) params.set('isActive', filterActive)
      if (filterSpecialty) params.set('specialty', filterSpecialty)
      return fetch(`/api/workshops?${params}`).then(r => r.json())
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
      toast.success('تعمیرگاه با موفقیت ایجاد شد')
      closeForm()
    },
    onError: () => toast.error('خطا در ایجاد تعمیرگاه'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) =>
      fetch(`/api/workshops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
      toast.success('تعمیرگاه با موفقیت بروزرسانی شد')
      closeForm()
    },
    onError: () => toast.error('خطا در بروزرسانی تعمیرگاه'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/workshops/${id}`, { method: 'DELETE' }).then(r => {
        if (!r.ok) return r.json().then(d => { throw new Error(d.error) })
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
      toast.success('تعمیرگاه با موفقیت حذف شد')
      setDeleteConfirm(null)
    },
    onError: (err: Error) => toast.error(err.message || 'خطا در حذف تعمیرگاه'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/workshops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
      toast.success('وضعیت تعمیرگاه تغییر یافت')
    },
    onError: () => toast.error('خطا در تغییر وضعیت'),
  })

  const openCreateForm = () => {
    setEditingWorkshop(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (workshop: Workshop) => {
    setEditingWorkshop(workshop)
    setForm({
      name: workshop.name,
      code: workshop.code,
      phone: workshop.phone || '',
      address: workshop.address || '',
      contactPerson: workshop.contactPerson || '',
      specialty: workshop.specialty || '',
      isActive: workshop.isActive,
      notes: workshop.notes || '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingWorkshop(null)
    setForm(emptyForm)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...form,
      phone: form.phone || undefined,
      address: form.address || undefined,
      contactPerson: form.contactPerson || undefined,
      specialty: form.specialty || undefined,
      notes: form.notes || undefined,
    }

    if (editingWorkshop) {
      updateMutation.mutate({ id: editingWorkshop.id, data })
    } else {
      createMutation.mutate(data as typeof emptyForm)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">تعمیرگاه‌ها</h2>
        <Button size="sm" onClick={openCreateForm}>
          <Plus className="h-4 w-4 ml-1" />
          تعمیرگاه جدید
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی تعمیرگاه..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filterActive} onValueChange={(v) => setFilterActive(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="وضعیت فعالیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="true">فعال</SelectItem>
              <SelectItem value="false">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSpecialty} onValueChange={(v) => setFilterSpecialty(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="تخصص" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              {Object.entries(workshopSpecialtyLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workshop List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>تعمیرگاهی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
          {workshops.map((ws: Workshop) => (
            <Card
              key={ws.id}
              className={`border-0 shadow-sm transition-shadow hover:shadow-md ${!ws.isActive ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                {/* Workshop Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <p className="text-sm font-medium truncate">{ws.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mr-6 mt-0.5">
                      کد: {toPersianNumber(ws.code)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={ws.isActive ? 'default' : 'secondary'} className="text-[10px]">
                      {ws.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                </div>

                {/* Workshop Details */}
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {ws.contactPerson && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>شخص تماس: {ws.contactPerson}</span>
                    </div>
                  )}
                  {ws.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span dir="ltr">{ws.phone}</span>
                    </div>
                  )}
                  {ws.specialty && (
                    <div className="flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 shrink-0" />
                      <span>تخصص: {workshopSpecialtyLabels[ws.specialty] || ws.specialty}</span>
                    </div>
                  )}
                  {ws.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{ws.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {toPersianNumber(ws._count?.workOrders || 0)} دستور کار
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPersianDate(ws.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleActiveMutation.mutate({ id: ws.id, isActive: !ws.isActive })}
                      title={ws.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                      {ws.isActive ? (
                        <ToggleRight className="h-4 w-4 text-teal-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditForm(ws)}
                      title="ویرایش"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteConfirm(ws.id)}
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form Sheet */}
      <Sheet open={showForm} onOpenChange={(open) => { if (!open) closeForm() }}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader className="px-5 pt-2 pb-1">
            <SheetTitle className="text-base">{editingWorkshop ? 'ویرایش تعمیرگاه' : 'افزودن تعمیرگاه جدید'}</SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">نام تعمیرگاه *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="نام تعمیرگاه"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">کد تعمیرگاه *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="مثلاً: WS-001"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">شخص تماس</Label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="نام شخص تماس"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">شماره تماس</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="شماره تماس"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">تخصص</Label>
              <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب تخصص" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">بدون تخصص</SelectItem>
                  {Object.entries(workshopSpecialtyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">آدرس</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="آدرس تعمیرگاه"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">توضیحات</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="توضیحات اضافی..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label className="text-sm font-medium">فعال</Label>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={closeForm}>انصراف</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                {editingWorkshop ? 'بروزرسانی' : 'ایجاد تعمیرگاه'}
              </Button>
            </div>
          </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأیید حذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            آیا از حذف این تعمیرگاه اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>انصراف</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
