'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { shiftLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Plus, ClipboardCheck } from 'lucide-react'
import { InspectionForm } from './InspectionForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

export function InspectionList() {
  const navigate = useAppStore((s) => s.navigate)
  const [showForm, setShowForm] = useState(false)

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => fetch('/api/inspections').then(r => r.json()),
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">بازدیدها</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 ml-1" />
          بازدید جدید
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>بازدیدی ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp: any) => (
            <Card key={insp.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{insp.asset?.nameFa}</p>
                    <p className="text-xs text-muted-foreground">{insp.asset?.assetCode}</p>
                  </div>
                  <StatusBadge status={insp.status} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{insp.inspector?.name}</span>
                    <span>{shiftLabels[insp.shift || ''] || '—'}</span>
                  </div>
                  <PersianDate date={insp.date} relative />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>ثبت بازدید جدید</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <InspectionForm onClose={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
