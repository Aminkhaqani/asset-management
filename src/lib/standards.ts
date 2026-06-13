export const lifecycleStageOptions = [
  { value: 'planning', label: 'برنامه‌ریزی/نیازسنجی' },
  { value: 'acquisition', label: 'تامین و خرید' },
  { value: 'commissioning', label: 'نصب و راه‌اندازی' },
  { value: 'operation', label: 'بهره‌برداری' },
  { value: 'maintenance', label: 'نگهداری و تعمیرات' },
  { value: 'renewal', label: 'نوسازی/بهسازی' },
  { value: 'disposal', label: 'اسقاط/خروج از سرویس' },
]

export const lifecycleStageLabels = Object.fromEntries(lifecycleStageOptions.map((option) => [option.value, option.label]))

export const riskLevelOptions = [
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'زیاد' },
  { value: 'critical', label: 'بحرانی' },
]

export const riskLevelLabels = Object.fromEntries(riskLevelOptions.map((option) => [option.value, option.label]))

export const maintenanceSubtypeOptions = {
  preventive: [
    { value: 'predetermined', label: 'پیشگیرانه زمان‌بندی‌شده' },
    { value: 'condition_based', label: 'مبتنی بر وضعیت' },
    { value: 'predictive', label: 'پیش‌بینانه' },
    { value: 'routine', label: 'روتین/ساده' },
  ],
  corrective: [
    { value: 'immediate', label: 'اصلاحی فوری' },
    { value: 'deferred', label: 'اصلاحی معوق' },
  ],
}

export const maintenanceSubtypeLabels = {
  ...Object.fromEntries(maintenanceSubtypeOptions.preventive.map((option) => [option.value, option.label])),
  ...Object.fromEntries(maintenanceSubtypeOptions.corrective.map((option) => [option.value, option.label])),
}

export const maintenanceActivityOptions = [
  { value: 'inspection', label: 'بازرسی/بازدید' },
  { value: 'monitoring', label: 'پایش وضعیت' },
  { value: 'testing', label: 'آزمون/تست' },
  { value: 'routine_maintenance', label: 'نگهداری روتین' },
  { value: 'overhaul', label: 'اورهال/بازآماد' },
  { value: 'fault_diagnosis', label: 'عیب‌یابی' },
  { value: 'fault_localization', label: 'محل‌یابی عیب' },
  { value: 'repair', label: 'تعمیر/اصلاح عیب' },
  { value: 'restoration', label: 'بازگردانی به کارکرد' },
  { value: 'modification', label: 'اصلاح/بهسازی' },
]

export const maintenanceActivityLabels = Object.fromEntries(maintenanceActivityOptions.map((option) => [option.value, option.label]))

export const failureCauseOptions = [
  { value: 'wear_out', label: 'فرسودگی/استهلاک' },
  { value: 'ageing', label: 'پیری/کهنگی' },
  { value: 'misuse', label: 'استفاده نادرست' },
  { value: 'design', label: 'طراحی' },
  { value: 'manufacturing', label: 'ساخت/تولید' },
  { value: 'installation', label: 'نصب/راه‌اندازی' },
  { value: 'maintenance', label: 'نگهداری نامناسب' },
  { value: 'external', label: 'عامل خارجی/محیطی' },
  { value: 'unknown', label: 'نامشخص' },
]

export const failureCauseLabels = Object.fromEntries(failureCauseOptions.map((option) => [option.value, option.label]))

export const detectionMethodOptions = [
  { value: 'operator_observation', label: 'مشاهده اپراتور' },
  { value: 'inspection', label: 'بازدید/بازرسی' },
  { value: 'condition_monitoring', label: 'پایش وضعیت' },
  { value: 'test', label: 'تست' },
  { value: 'alarm', label: 'آلارم/هشدار' },
  { value: 'breakdown', label: 'توقف/خرابی آشکار' },
]

export const detectionMethodLabels = Object.fromEntries(detectionMethodOptions.map((option) => [option.value, option.label]))
