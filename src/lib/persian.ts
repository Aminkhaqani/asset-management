const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '—'
  const str = String(num)
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

export function formatPersianDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatPersianDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'همین الان'
  if (minutes < 60) return `${toPersianNumber(minutes)} دقیقه پیش`
  if (hours < 24) return `${toPersianNumber(hours)} ساعت پیش`
  if (days < 7) return `${toPersianNumber(days)} روز پیش`
  return formatPersianDate(date)
}

export const shiftLabels: Record<string, string> = {
  morning: 'صبحی',
  afternoon: 'عصر',
  night: 'شب',
}

export const statusLabels: Record<string, string> = {
  active: 'فعال',
  faulty: 'خراب',
  under_maintenance: 'در تعمیر',
  retired: 'بازنشسته',
  normal: 'عادی',
  warning: 'هشدار',
  critical: 'بحرانی',
  open: 'باز',
  in_progress: 'در حال انجام',
  resolved: 'رفع شده',
  closed: 'بسته شده',
  pending: 'در انتظار',
  assigned: 'اختصاص یافته',
  completed: 'تکمیل شده',
  approved: 'تأیید شده',
  rejected: 'رد شده',
}

export const priorityLabels: Record<string, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
  critical: 'بحرانی',
}

export const criticalityLabels: Record<string, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
  critical: 'بحرانی',
}

export const faultTypeLabels: Record<string, string> = {
  electrical: 'برقی',
  mechanical: 'مکانیکی',
  hydraulic: 'هیدرولیکی',
  control: 'کنترلی',
  leakage: 'نشتی',
  other: 'سایر',
}

export const oilLevelLabels: Record<string, string> = {
  normal: 'نرمال',
  low: 'پایین',
  critical: 'بحرانی',
}

export const vibrationLabels: Record<string, string> = {
  normal: 'نرمال',
  abnormal: 'غیرطبیعی',
}

export const noiseLabels: Record<string, string> = {
  normal: 'نرمال',
  abnormal: 'غیرطبیعی',
}

export const roleLabels: Record<string, string> = {
  admin: 'مدیر سیستم',
  manager: 'مدیر',
  supervisor: 'سرپرست',
  technician: 'تکنسین',
}

export const recurrenceLabels: Record<string, string> = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  quarterly: 'فصلی',
  yearly: 'سالانه',
}

export const checklistFrequencyLabels: Record<string, string> = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  quarterly: 'فصلی',
}

export const notificationTypeLabels: Record<string, string> = {
  fault: 'خرابی',
  pm_overdue: 'نگهداری تأخیر یافته',
  assignment: 'اختصاص کار',
  approval: 'تأیید',
  system: 'سیستم',
}

export const repairTypeLabels: Record<string, string> = {
  internal: 'داخلی',
  external: 'خارجی (تعمیرگاه)',
}

export const workshopSpecialtyLabels: Record<string, string> = {
  chiller: 'چیلر',
  elevator: 'آسانسور',
  electrical: 'برق',
  hvac: 'تهویه مطبوع',
  plumbing: 'تاسیسات آب',
  fire: 'ایمنی و آتش‌نشانی',
  generator: 'ژنراتور',
  bms: 'سیستم مدیریت ساختمان',
  other: 'سایر',
}
