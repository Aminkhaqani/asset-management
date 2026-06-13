export type AssetType = 'equipment' | 'vehicle' | 'wagon' | 'chiller' | 'other'

export type AssetFieldType = 'text' | 'number' | 'select' | 'date' | 'textarea'

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
  identityFields: AssetTypeField[]
}

const ownershipFields: AssetTypeField[] = [
  {
    key: 'ownershipType',
    label: 'نوع مالکیت',
    type: 'select',
    options: [
      { value: 'owned', label: 'تملکی' },
      { value: 'leased', label: 'اجاره‌ای' },
      { value: 'contracted', label: 'قراردادی' },
      { value: 'borrowed', label: 'امانی' },
    ],
  },
  { key: 'documentNumber', label: 'شماره سند', type: 'text', placeholder: 'شماره سند یا پرونده' },
  { key: 'purchaseInvoiceNumber', label: 'شماره فاکتور خرید', type: 'text', placeholder: 'شماره فاکتور' },
  { key: 'purchaseDate', label: 'تاریخ خرید/شروع بهره‌برداری', type: 'date' },
  { key: 'vendorOrOwner', label: 'مالک/فروشنده/طرف قرارداد', type: 'text', placeholder: 'نام شخص یا شرکت' },
  { key: 'contractNumber', label: 'شماره قرارداد', type: 'text', placeholder: 'شماره قرارداد اجاره یا بهره‌برداری' },
  { key: 'contractExpiry', label: 'پایان قرارداد/گارانتی', type: 'date' },
]

export const assetTypeDefinitions: AssetTypeDefinition[] = [
  {
    value: 'equipment',
    label: 'تجهیزات عمومی',
    description: 'دارایی‌های تاسیساتی یا تجهیزاتی با مشخصات عمومی',
    fields: [
      { key: 'weight', label: 'وزن', type: 'text', placeholder: 'مثلا 250 کیلوگرم' },
      { key: 'power', label: 'توان', type: 'text', placeholder: 'مثلا 15 kW' },
      { key: 'workingPressure', label: 'فشار کاری', type: 'text', placeholder: 'مثلا 8 bar' },
      { key: 'usage', label: 'کاربری', type: 'text', placeholder: 'کاربری اصلی دارایی' },
    ],
    identityFields: ownershipFields,
  },
  {
    value: 'vehicle',
    label: 'خودرو',
    description: 'دارایی‌های ناوگان خودرویی',
    fields: [
      { key: 'mileage', label: 'کارکرد', type: 'number', unit: 'کیلومتر', placeholder: 'مثلا 85000' },
      { key: 'plateNumber', label: 'شماره پلاک', type: 'text', placeholder: 'مثلا 12 ب 345 ایران 67' },
      { key: 'vin', label: 'شماره شاسی', type: 'text', placeholder: 'VIN', },
      { key: 'engineNumber', label: 'شماره موتور', type: 'text', placeholder: 'شماره موتور' },
      { key: 'manufactureYear', label: 'سال ساخت', type: 'number', placeholder: 'مثلا 1400' },
      { key: 'vehicleUsage', label: 'کاربری وسیله', type: 'text', placeholder: 'سواری، پخش، سرویس کارکنان، عملیاتی' },
      { key: 'color', label: 'رنگ', type: 'text', placeholder: 'مثلا سفید' },
      { key: 'passengerCapacity', label: 'تعداد سرنشین', type: 'number', placeholder: 'مثلا 5' },
      { key: 'axleCount', label: 'تعداد محور', type: 'number', placeholder: 'مثلا 2' },
      { key: 'enginePower', label: 'قدرت موتور', type: 'text', placeholder: 'مثلا 180 hp' },
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
      { key: 'fuelCapacity', label: 'ظرفیت مخزن/باتری', type: 'text', placeholder: 'مثلا 60 لیتر یا 75 kWh' },
      { key: 'averageFuelConsumption', label: 'مصرف میانگین', type: 'text', placeholder: 'مثلا 8 لیتر در 100 کیلومتر' },
      { key: 'tireSize', label: 'سایز تایر', type: 'text', placeholder: 'مثلا 205/55R16' },
      { key: 'lastOverhaulDate', label: 'آخرین تعمیر اساسی', type: 'date' },
    ],
    identityFields: [
      ...ownershipFields,
      { key: 'vehicleCardNumber', label: 'شماره کارت خودرو', type: 'text', placeholder: 'شماره کارت خودرو' },
      { key: 'ownerName', label: 'نام مالک', type: 'text', placeholder: 'نام شخص یا شرکت مالک' },
      { key: 'ownerContact', label: 'اطلاعات تماس مالک', type: 'text', placeholder: 'تلفن یا نشانی مالک' },
      { key: 'registrationDate', label: 'تاریخ ثبت', type: 'date' },
      { key: 'registrationRenewalDate', label: 'تاریخ تمدید ثبت', type: 'date' },
      { key: 'purchaseAmount', label: 'مبلغ خرید', type: 'number', placeholder: 'مبلغ به ریال' },
      { key: 'depreciationRate', label: 'نرخ استهلاک', type: 'text', placeholder: 'مثلا 20٪ سالانه' },
      { key: 'thirdPartyInsurer', label: 'بیمه‌گر شخص ثالث', type: 'text', placeholder: 'نام شرکت بیمه' },
      { key: 'thirdPartyPolicyNumber', label: 'شماره بیمه شخص ثالث', type: 'text', placeholder: 'شماره بیمه‌نامه' },
      { key: 'thirdPartyCoverageAmount', label: 'مبلغ پوشش شخص ثالث', type: 'number', placeholder: 'مبلغ به ریال' },
      { key: 'thirdPartyInsuranceExpiry', label: 'پایان بیمه شخص ثالث', type: 'date' },
      { key: 'bodyInsurer', label: 'بیمه‌گر بدنه', type: 'text', placeholder: 'نام شرکت بیمه' },
      { key: 'bodyPolicyNumber', label: 'شماره بیمه بدنه', type: 'text', placeholder: 'شماره بیمه‌نامه' },
      { key: 'bodyCoverageAmount', label: 'مبلغ پوشش بدنه', type: 'number', placeholder: 'مبلغ به ریال' },
      { key: 'bodyInsuranceExpiry', label: 'پایان بیمه بدنه', type: 'date' },
      { key: 'technicalInspectionExpiry', label: 'پایان معاینه فنی', type: 'date' },
      { key: 'trafficPermitExpiry', label: 'پایان مجوز طرح ترافیک', type: 'date' },
      { key: 'emissionsPermitExpiry', label: 'پایان مجوز آلایندگی', type: 'date' },
      { key: 'warrantyProvider', label: 'ارائه‌دهنده گارانتی', type: 'text', placeholder: 'نام شرکت یا نمایندگی' },
      { key: 'warrantyExpiry', label: 'پایان گارانتی', type: 'date' },
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
      { key: 'wagonUsage', label: 'کاربری واگن', type: 'text', placeholder: 'مسافری، باری، خدماتی' },
      { key: 'brakeSystem', label: 'سیستم ترمز', type: 'text', placeholder: 'نوع سیستم ترمز' },
    ],
    identityFields: [
      ...ownershipFields,
      { key: 'railRegistryNumber', label: 'شماره ثبت ریلی', type: 'text', placeholder: 'شماره ثبت یا مجوز ریلی' },
      { key: 'operationPermitExpiry', label: 'پایان مجوز بهره‌برداری', type: 'date' },
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
      { key: 'power', label: 'توان مصرفی', type: 'text', placeholder: 'مثلا 320 kW' },
      { key: 'evaporatorPressure', label: 'فشار اواپراتور', type: 'text', placeholder: 'مثلا 4 bar' },
      { key: 'condenserPressure', label: 'فشار کندانسور', type: 'text', placeholder: 'مثلا 12 bar' },
    ],
    identityFields: [
      ...ownershipFields,
      { key: 'warrantyCardNumber', label: 'شماره کارت ضمانت', type: 'text', placeholder: 'شماره گارانتی' },
      { key: 'contractor', label: 'پیمانکار نصب/بهره‌برداری', type: 'text', placeholder: 'نام پیمانکار' },
      { key: 'serviceContractNumber', label: 'قرارداد سرویس', type: 'text', placeholder: 'شماره قرارداد سرویس' },
    ],
  },
  {
    value: 'other',
    label: 'سایر دارایی‌ها',
    description: 'دارایی‌هایی که نوع اختصاصی ندارند',
    fields: [
      { key: 'identifier', label: 'شناسه اختصاصی', type: 'text', placeholder: 'شناسه یا ویژگی مهم' },
      { key: 'usage', label: 'کاربری', type: 'text', placeholder: 'کاربری دارایی' },
      { key: 'technicalNotes', label: 'مشخصات تکمیلی', type: 'textarea', placeholder: 'مشخصات اختصاصی این دارایی' },
    ],
    identityFields: ownershipFields,
  },
]

export const getAssetTypeDefinition = (assetType?: string) =>
  assetTypeDefinitions.find((definition) => definition.value === assetType) || assetTypeDefinitions[0]

export const getAssetTypeLabel = (assetType?: string) => getAssetTypeDefinition(assetType).label
