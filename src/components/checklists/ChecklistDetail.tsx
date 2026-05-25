'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, checklistFrequencyLabels } from '@/lib/persian'
import { ArrowRight, CheckSquare, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function ChecklistDetail() {
  const { selectedChecklistId, navigate } = useAppStore()
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const { data: checklists = [] } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => fetch('/api/checklists').then(r => r.json()),
    enabled: !!selectedChecklistId,
  })

  const checklist = checklists.find((c: any) => c.id === selectedChecklistId)

  if (!checklist) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('checklists')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold">چک‌لیست</h2>
        </div>
        <p className="text-center text-muted-foreground py-16">چک‌لیست یافت نشد</p>
      </div>
    )
  }

  const items: string[] = checklist.items ? JSON.parse(checklist.items) : []
  const isOverdue = checklist.nextDueAt && new Date(checklist.nextDueAt) < new Date()

  const toggleItem = (idx: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('checklists')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{checklist.title}</h2>
          <p className="text-sm text-muted-foreground">{checklist.asset?.nameFa}</p>
        </div>
      </div>

      {/* Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">دوره تکرار</span>
            <Badge variant="outline">{checklistFrequencyLabels[checklist.frequency || ''] || '—'}</Badge>
          </div>
          {checklist.lastDoneAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">آخرین اجرا</span>
              <PersianDate date={checklist.lastDoneAt} />
            </div>
          )}
          {checklist.nextDueAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">اجرای بعدی</span>
              <div className="flex items-center gap-1">
                <PersianDate date={checklist.nextDueAt} />
                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">آیتم‌های چک‌لیست ({toPersianNumber(checkedItems.size)}/{toPersianNumber(items.length)})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={checkedItems.has(idx)}
                  onCheckedChange={() => toggleItem(idx)}
                />
                <span className={`text-sm ${checkedItems.has(idx) ? 'line-through text-muted-foreground' : ''}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
