'use client'

import { formatPersianDate, formatRelativeTime, formatPersianDateTime, toPersianNumber } from '@/lib/persian'

export function PersianDate({ date, relative = false, time = false }: { date: Date | string | null | undefined; relative?: boolean; time?: boolean }) {
  if (!date) return <span>—</span>
  if (relative) return <span>{formatRelativeTime(date)}</span>
  if (time) return <span>{formatPersianDateTime(date)}</span>
  return <span>{formatPersianDate(date)}</span>
}

export function PersianNumber({ children }: { children: number | string | null | undefined }) {
  return <span>{toPersianNumber(children)}</span>
}
