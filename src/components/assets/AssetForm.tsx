'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { assetTypeDefinitions, AssetTypeField, getAssetTypeDefinition } from '@/lib/asset-types'
import { lifecycleStageOptions, riskLevelOptions } from '@/lib/standards'
import { Plus, Trash2 } from 'lucide-react'

interface AssetFormProps {
  categories: any[]
  locations: any[]
  onClose: () => void
}

type FieldValues = Record<string, string>

type PMItem = {
  id: string
  type: string
  title: string
  intervalValue: string
  intervalUnit: string
  owner: string
  description: string
  checklist: string
}

const pmItemTypes = [
  { value: 'periodic_inspection', label: 'بازدید دوره‌ای' },
  { value: 'checklist', label: 'چک‌لیست' },
  { value: 'annual_overhaul', label: 'اورهال یک‌ساله' },
  { value: 'service', label: 'سرویس دوره‌ای' },
  { value: 'calibration', label: 'کالیبراسیون' },
  { value: 'safety_test', label: 'تست ایمنی' },
]

const intervalUnits = [
  { value: 'day', label: 'روز' },
  { value: 'week', label: 'هفته' },
  { value: 'month', label: 'ماه' },
  { value: 'year', label: 'سال' },
  { value: 'running_hour', label: 'ساعت کارکرد' },
]

const assignmentFields: AssetTypeField[] = [
  { key: 'primaryExpertId', label: 'کارشناس مسئول', type: 'select' },
  { key: 'maintenanceOwnerId', label: 'مسئول تعمیرات', type: 'select' },
  { key: 'inspectionOwnerId', label: 'مسئول بازدید', type: 'select' },
  { key: 'operationalUnit', label: 'واحد بهره‌بردار', type: 'text', placeholder: 'مثلا تاسیسات، ناوگان، عملیات' },
  { key: 'custodian', label: 'تحویل‌گیرنده/امین اموال', type: 'text', placeholder: 'نام شخص یا واحد' },
]

export function AssetForm({ categories, locations, onClose }: AssetFormProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    assetCode: '',
    nameFa: '',
    nameEn: '',
    assetType: 'equipment',
    lifecycleStage: 'operation',
    assetPortfolio: '',
    requiredFunction: '',
    valueContribution: '',
    performanceTarget: '',
    riskImpact: 'medium',
    riskLikelihood: 'medium',
    regulatoryRequirements: '',
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
    technicalFields: {} as FieldValues,
    identityFields: {} as FieldValues,
    assignmentFields: {} as FieldValues,
    pmItems: [] as PMItem[],
  })

  const selectedAssetType = getAssetTypeDefinition(form.assetType)

  const { data: usersResponse = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const users = Array.isArray(usersResponse) ? usersResponse : []

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('دارایی با موفقیت ایجاد شد')
      onClose()
    },
    onError: () => {
      toast.error('خطا در ایجاد دارایی')
    },
  })

  const cleanValues = (values: FieldValues) =>
    Object.fromEntries(Object.entries(values).filter(([, value]) => String(value).trim() !== ''))

  const updateSectionField = (
    section: 'technicalFields' | 'identityFields' | 'assignmentFields' | 'pmFields',
    key: string,
    value: string
  ) => {
    setForm({
      ...form,
      [section]: {
        ...form[section],
        [key]: value,
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const technicalFields = cleanValues(form.technicalFields)
    const identityFields = cleanValues(form.identityFields)
    const assignmentValues = cleanValues(form.assignmentFields)
    const pmItems = form.pmItems
      .map((item) => ({
        ...item,
        title: item.title.trim(),
        intervalValue: item.intervalValue.trim(),
        owner: item.owner.trim(),
        description: item.description.trim(),
        checklist: item.checklist.trim(),
      }))
      .filter((item) => item.title || item.description || item.checklist)

    mutation.mutate({
      assetCode: form.assetCode,
      nameFa: form.nameFa,
      nameEn: form.nameEn,
      assetType: form.assetType,
      lifecycleStage: form.lifecycleStage,
      assetPortfolio: form.assetPortfolio,
      requiredFunction: form.requiredFunction,
      valueContribution: form.valueContribution,
      performanceTarget: form.performanceTarget,
      riskImpact: form.riskImpact,
      riskLikelihood: form.riskLikelihood,
      regulatoryRequirements: form.regulatoryRequirements,
      categoryId: form.categoryId,
      locationId: form.locationId,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      capacity: form.capacity,
      criticality: form.criticality,
      status: form.status,
      notes: form.notes,
      qrCode: form.qrCode || `QR-${form.assetCode}`,
      specifications: form.specifications,
      customFields: {
        ...technicalFields,
        identity: identityFields,
        assignment: assignmentValues,
        pm: {
          items: pmItems,
        },
      },
    })
  }

  const renderField = (
    field: AssetTypeField,
    value: string,
    onChange: (value: string) => void,
    options?: Array<{ value: string; label: string }>
  ) => {
    const resolvedOptions = options || field.options || []

    if (field.type === 'select') {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={`انتخاب ${field.label}`} /></SelectTrigger>
          <SelectContent>
            {resolvedOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === 'textarea') {
      return <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
    }

    return (
      <div className="relative">
        <Input
          type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
    )
  }

  const renderFieldGrid = (
    fields: AssetTypeField[],
    section: 'technicalFields' | 'identityFields' | 'assignmentFields'
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
      {fields.map((field) => {
        const userOptions = ['primaryExpertId', 'maintenanceOwnerId', 'inspectionOwnerId'].includes(field.key)
          ? users.map((user: any) => ({ value: user.id, label: user.name }))
          : undefined

        return (
          <div key={field.key} className={field.type === 'textarea' ? 'space-y-1.5 md:col-span-2' : 'space-y-1.5'}>
            <Label className="text-sm font-medium">{field.label}</Label>
            {renderField(
              field,
              form[section][field.key] || '',
              (value) => updateSectionField(section, field.key, value),
              userOptions
            )}
          </div>
        )
      })}
    </div>
  )

  const addPMItem = () => {
    setForm({
      ...form,
      pmItems: [
        ...form.pmItems,
        {
          id: crypto.randomUUID(),
          type: 'periodic_inspection',
          title: '',
          intervalValue: '',
          intervalUnit: 'month',
          owner: '',
          description: '',
          checklist: '',
        },
      ],
    })
  }

  const updatePMItem = (id: string, key: keyof PMItem, value: string) => {
    setForm({
      ...form,
      pmItems: form.pmItems.map((item) => item.id === id ? { ...item, [key]: value } : item),
    })
  }

  const removePMItem = (id: string) => {
    setForm({
      ...form,
      pmItems: form.pmItems.filter((item) => item.id !== id),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="base" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1">
          <TabsTrigger value="base" className="min-w-24">اصلی</TabsTrigger>
          <TabsTrigger value="identity" className="min-w-28">هویتی/مالکیت</TabsTrigger>
          <TabsTrigger value="standard" className="min-w-28">ارزش/ریسک</TabsTrigger>
          <TabsTrigger value="technical" className="min-w-24">فنی</TabsTrigger>
          <TabsTrigger value="assignment" className="min-w-28">تخصیص/مکان</TabsTrigger>
          <TabsTrigger value="pm" className="min-w-24">PM</TabsTrigger>
        </TabsList>

        <TabsContent value="base" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">کد دارایی *</Label>
              <Input value={form.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} placeholder="مثلا: CAR-001" required dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">نام فارسی *</Label>
              <Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} placeholder="نام دارایی" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">نام انگلیسی</Label>
              <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="English name" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">نوع دارایی *</Label>
              <Select
                value={form.assetType}
                onValueChange={(value) => setForm({ ...form, assetType: value, technicalFields: {}, identityFields: {} })}
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
              <Select value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value })} required>
                <SelectTrigger><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>{category.nameFa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">سطح اهمیت</Label>
              <Select value={form.criticality} onValueChange={(value) => setForm({ ...form, criticality: value })}>
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
        </TabsContent>

        <TabsContent value="identity" className="space-y-4">
          {renderFieldGrid(selectedAssetType.identityFields, 'identityFields')}
        </TabsContent>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">مرحله چرخه عمر</Label>
              <Select value={form.lifecycleStage} onValueChange={(value) => setForm({ ...form, lifecycleStage: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lifecycleStageOptions.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">پرتفوی/گروه دارایی</Label>
              <Input
                value={form.assetPortfolio}
                onChange={(e) => setForm({ ...form, assetPortfolio: e.target.value })}
                placeholder="مثلا ناوگان خط ۱، تاسیسات مرکزی، تجهیزات حیاتی"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">شدت پیامد ریسک</Label>
              <Select value={form.riskImpact} onValueChange={(value) => setForm({ ...form, riskImpact: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {riskLevelOptions.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">احتمال وقوع ریسک</Label>
              <Select value={form.riskLikelihood} onValueChange={(value) => setForm({ ...form, riskLikelihood: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {riskLevelOptions.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium">کارکرد مورد انتظار</Label>
              <Textarea
                value={form.requiredFunction}
                onChange={(e) => setForm({ ...form, requiredFunction: e.target.value })}
                placeholder="کارکردی که دارایی باید در شرایط تعریف‌شده انجام دهد"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium">ارزش و نقش در اهداف سازمان</Label>
              <Textarea
                value={form.valueContribution}
                onChange={(e) => setForm({ ...form, valueContribution: e.target.value })}
                placeholder="این دارایی چه ارزشی ایجاد می‌کند و به کدام هدف عملیاتی/مالی/ایمنی وصل است"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium">هدف عملکردی/سطح خدمت</Label>
              <Textarea
                value={form.performanceTarget}
                onChange={(e) => setForm({ ...form, performanceTarget: e.target.value })}
                placeholder="مثلا دسترس‌پذیری هدف، ظرفیت هدف، کیفیت خدمت یا شاخص عملکرد"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium">الزامات قانونی، ایمنی و قراردادی</Label>
              <Textarea
                value={form.regulatoryRequirements}
                onChange={(e) => setForm({ ...form, regulatoryRequirements: e.target.value })}
                placeholder="الزامات بازرسی، گارانتی، قرارداد، ایمنی یا مقررات مرتبط"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
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
              <Label className="text-sm font-medium">ظرفیت عمومی</Label>
              <Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="مثلا ۵ نفر، ۴۵۰ تن، ۶۰ تن بار" />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
            <div>
              <p className="text-sm font-medium">مشخصات فنی اختصاصی {selectedAssetType.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedAssetType.description}</p>
            </div>
            {renderFieldGrid(selectedAssetType.fields, 'technicalFields')}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">مشخصات فنی آزاد</Label>
            <Textarea value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} placeholder="اطلاعات تکمیلی یا JSON فنی" dir="ltr" />
          </div>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">مکان *</Label>
              <Select value={form.locationId} onValueChange={(value) => setForm({ ...form, locationId: value })} required>
                <SelectTrigger><SelectValue placeholder="انتخاب مکان" /></SelectTrigger>
                <SelectContent>
                  {locations.map((location: any) => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">وضعیت بهره‌برداری</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="faulty">خراب</SelectItem>
                  <SelectItem value="under_maintenance">در تعمیر</SelectItem>
                  <SelectItem value="retired">بازنشسته</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {renderFieldGrid(assignmentFields, 'assignmentFields')}
        </TabsContent>

        <TabsContent value="pm" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">برنامه‌ها و دستورالعمل‌های PM</p>
              <p className="text-xs text-muted-foreground mt-1">
                ابتدا لیست خالی است؛ بازدید، چک‌لیست، اورهال یا سرویس‌ها را یکی‌یکی اضافه کنید.
              </p>
            </div>
            <Button type="button" size="sm" onClick={addPMItem}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن آیتم
            </Button>
          </div>

          {form.pmItems.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">هنوز آیتم PM ثبت نشده</p>
              <p className="text-xs text-muted-foreground mt-1">
                مثلا بازدید دوره‌ای، چک‌لیست، اورهال یک‌ساله یا کالیبراسیون را اضافه کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.pmItems.map((item, index) => (
                <div key={item.id} className="rounded-lg border bg-background p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">آیتم {index + 1}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePMItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">نوع آیتم</Label>
                      <Select value={item.type} onValueChange={(value) => updatePMItem(item.id, 'type', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {pmItemTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">عنوان</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updatePMItem(item.id, 'title', e.target.value)}
                        placeholder="مثلا بازدید ماهانه سیستم ترمز"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">دوره تکرار</Label>
                      <div className="grid grid-cols-[1fr_120px] gap-2">
                        <Input
                          type="number"
                          value={item.intervalValue}
                          onChange={(e) => updatePMItem(item.id, 'intervalValue', e.target.value)}
                          placeholder="مثلا 1"
                          dir="ltr"
                        />
                        <Select value={item.intervalUnit} onValueChange={(value) => updatePMItem(item.id, 'intervalUnit', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {intervalUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">مسئول اجرا</Label>
                      <Input
                        value={item.owner}
                        onChange={(e) => updatePMItem(item.id, 'owner', e.target.value)}
                        placeholder="نام شخص، تیم یا پیمانکار"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-sm font-medium">شرح دستورالعمل</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updatePMItem(item.id, 'description', e.target.value)}
                        placeholder="شرح کار، نکات ایمنی، ابزار لازم یا شرایط انجام"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-sm font-medium">چک‌لیست/اقلام کنترلی</Label>
                      <Textarea
                        value={item.checklist}
                        onChange={(e) => updatePMItem(item.id, 'checklist', e.target.value)}
                        placeholder="هر مورد را در یک خط بنویسید"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">توضیحات کلی</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات اضافه درباره دارایی" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره دارایی'}
        </Button>
      </div>
    </form>
  )
}
