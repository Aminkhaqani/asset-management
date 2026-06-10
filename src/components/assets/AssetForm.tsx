'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { assetTypeDefinitions, getAssetTypeDefinition } from '@/lib/asset-types'

interface AssetFormProps {
  categories: any[]
  locations: any[]
  onClose: () => void
}

export function AssetForm({ categories, locations, onClose }: AssetFormProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    assetCode: '',
    nameFa: '',
    nameEn: '',
    assetType: 'equipment',
    categoryId: '',
    locationId: '',
    brand: '',
    model: '',
    serialNumber: '',
    capacity: '',
    criticality: 'medium',
    status: 'active',
    notes: '',
    qrCode: '',
    specifications: '',
    customFields: {} as Record<string, string>,
  })

  const selectedAssetType = getAssetTypeDefinition(form.assetType)

  const updateCustomField = (key: string, value: string) => {
    setForm({
      ...form,
      customFields: {
        ...form.customFields,
        [key]: value,
      },
    })
  }

  const cleanCustomFields = () => {
    return Object.fromEntries(
      Object.entries(form.customFields).filter(([, value]) => String(value).trim() !== '')
    )
  }

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('دارایی با موفقیت ایجاد شد')
      onClose()
    },
    onError: () => {
      toast.error('خطا در ایجاد دارایی')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      qrCode: form.qrCode || `QR-${form.assetCode}`,
      customFields: cleanCustomFields(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">کد دارایی *</Label>
          <Input value={form.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} placeholder="مثلا: CH-001" required dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">نام فارسی *</Label>
          <Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} placeholder="نام فارسی تجهیز" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">نام انگلیسی</Label>
          <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="English name" dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">نوع دارایی *</Label>
          <Select
            value={form.assetType}
            onValueChange={(v) => setForm({ ...form, assetType: v, customFields: {} })}
            required
          >
            <SelectTrigger><SelectValue placeholder="انتخاب نوع دارایی" /></SelectTrigger>
            <SelectContent>
              {assetTypeDefinitions.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">دسته‌بندی *</Label>
          <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })} required>
            <SelectTrigger><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nameFa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">مکان *</Label>
          <Select value={form.locationId} onValueChange={(v) => setForm({ ...form, locationId: v })} required>
            <SelectTrigger><SelectValue placeholder="انتخاب مکان" /></SelectTrigger>
            <SelectContent>
              {locations.map((loc: any) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">برند</Label>
          <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="نام برند" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">مدل</Label>
          <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="مدل" dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">شماره سریال</Label>
          <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="شماره سریال" dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">ظرفیت</Label>
          <Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="ظرفیت تجهیز" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">سطح اهمیت</Label>
          <Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v })}>
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
      {selectedAssetType.fields.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
          <div>
            <p className="text-sm font-medium">ویژگی‌های اختصاصی {selectedAssetType.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{selectedAssetType.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {selectedAssetType.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-sm font-medium">{field.label}</Label>
                {field.type === 'select' ? (
                  <Select
                    value={form.customFields[field.key] || ''}
                    onValueChange={(v) => updateCustomField(field.key, v)}
                  >
                    <SelectTrigger><SelectValue placeholder={`انتخاب ${field.label}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={form.customFields[field.key] || ''}
                      onChange={(e) => updateCustomField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      dir={field.type === 'number' ? 'ltr' : undefined}
                      className={field.unit ? 'pl-20' : undefined}
                    />
                    {field.unit && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {field.unit}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">مشخصات فنی</Label>
        <Textarea value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} placeholder="مشخصات فنی عمومی (JSON)" dir="ltr" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">توضیحات</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات اضافی" />
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t mt-4">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </div>
    </form>
  )
}
