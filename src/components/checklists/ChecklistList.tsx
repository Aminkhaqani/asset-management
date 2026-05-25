'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { PersianDate } from '@/components/shared/PersianDate'
import { toPersianNumber, checklistFrequencyLabels } from '@/lib/persian'
import { CheckSquare, AlertTriangle, Clock, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'

export function ChecklistList() {
  const navigate = useAppStore((s) => s.navigate)

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => fetch('/api/checklists').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">چک‌لیست‌ها</h2>
      
      {checklists.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>چک‌لیستی ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((cl: any) => {
            const items = cl.items ? JSON.parse(cl.items) : []
            const isOverdue = cl.nextDueAt && new Date(cl.nextDueAt) < new Date()
            return (
              <Card
                key={cl.id}
                className={`border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-r-4 border-r-red-500' : ''}`}
                onClick={() => navigate('checklist-detail', { checklistId: cl.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{cl.title}</p>
                      <p className="text-xs text-muted-foreground">{cl.asset?.nameFa} • {cl.asset?.assetCode}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {checklistFrequencyLabels[cl.frequency || ''] || cl.frequency}
                      </Badge>
                      {isOverdue && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>{toPersianNumber(items.length)} آیتم</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {cl.lastDoneAt && <span>آخرین اجرا: <PersianDate date={cl.lastDoneAt} relative /></span>}
                      {isOverdue && <span className="text-red-500 font-medium">تأخیر یافته</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
