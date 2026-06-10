export type AssetType = 'equipment' | 'vehicle' | 'wagon' | 'chiller' | 'other'

export type AssetFieldType = 'text' | 'number' | 'select'

export interface AssetTypeField {
  key: string
  label: string
  type: AssetFieldType
  placeholder?: string
  unit?: string
  options?: Array<{ value: string; label: string }>
}

export interface AssetTypeDefinition {
  value: AssetType
  label: string
  description: string
  fields: AssetTypeField[]
}

export const assetTypeDefinitions: AssetTypeDefinition[] = [
  {
    value: 'equipment',
    label: 'تجهیزات عمومی',
    description: 'دارایی‌های تاسیساتی یا تجهیزاتی با مشخصات عمومی',
    fields: [],
  },
  {
    value: 'vehicle',
    label: 'خودرو',
    description: 'دارایی‌های ناوگان خودرویی',
    fields: [
      { key: 'mileage', label: 'کارکرد', type: 'number', unit: 'کیلومتر', placeholder: 'مثلا 85000' },
      { key: 'plateNumber', label: 'شماره پلاک', type: 'text', placeholder: 'مثلا 12 ب 345 ایران 67' },
      { key: 'vin', label: 'شماره شاسی', type: 'text', placeholder: 'VIN', },
      {
        key: 'fuelType',
        label: 'نوع سوخت',
        type: 'select',
        options: [
          { value: 'gasoline', label: 'بنزین' },
          { value: 'diesel', label: 'گازوئیل' },
          { value: 'hybrid', label: 'هیبرید' },
          { value: 'electric', label: 'برقی' },
        ],
      },
    ],
  },
  {
    value: 'wagon',
    label: 'واگن',
    description: 'دارایی‌های ریلی و واگنی',
    fields: [
      { key: 'wagonNumber', label: 'شماره واگن', type: 'text', placeholder: 'مثلا WGN-1042' },
      { key: 'axleCount', label: 'تعداد محور', type: 'number', placeholder: 'مثلا 4' },
      { key: 'loadCapacity', label: 'ظرفیت بار', type: 'text', placeholder: 'مثلا 60 تن' },
    ],
  },
  {
    value: 'chiller',
    label: 'چیلر',
    description: 'چیلرها و تجهیزات سرمایشی مرکزی',
    fields: [
      { key: 'refrigerant', label: 'نوع مبرد', type: 'text', placeholder: 'مثلا R-134a' },
      { key: 'coolingCapacity', label: 'ظرفیت سرمایش', type: 'text', placeholder: 'مثلا 450 تن' },
      { key: 'compressorCount', label: 'تعداد کمپرسور', type: 'number', placeholder: 'مثلا 2' },
    ],
  },
  {
    value: 'other',
    label: 'سایر دارایی‌ها',
    description: 'دارایی‌هایی که نوع اختصاصی ندارند',
    fields: [
      { key: 'identifier', label: 'شناسه اختصاصی', type: 'text', placeholder: 'شناسه یا ویژگی مهم' },
    ],
  },
]

export const getAssetTypeDefinition = (assetType?: string) =>
  assetTypeDefinitions.find((definition) => definition.value === assetType) || assetTypeDefinitions[0]

export const getAssetTypeLabel = (assetType?: string) => getAssetTypeDefinition(assetType).label
