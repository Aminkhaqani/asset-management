'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { PersianDate } from '@/components/shared/PersianDate'
import { faultTypeLabels } from '@/lib/persian'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FaultForm } from './FaultForm'
import { useState } from 'react'

export function FaultList() {
  const navigate = useAppStore((s) => s.navigate)
  const [showForm, setShowForm] = useState(false)

  const { data: faults = [], isLoading } = useQuery({
    queryKey: ['faults'],
    queryFn: () => fetch('/api/faults').then(r => r.json()),
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">خرابی‌ها</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 ml-1" />
          ثبت خرابی
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : faults.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>خرابی ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faults.map((fault: any) => (
            <Card
              key={fault.id}
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('fault-detail', { faultId: fault.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{fault.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fault.asset?.nameFa} • {fault.asset?.assetCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {faultTypeLabels[fault.faultType] || fault.faultType} • {fault.reportedBy?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <PriorityBadge priority={fault.priority} />
                    <StatusBadge status={fault.status} />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                  <PersianDate date={fault.reportedAt} relative />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader className="px-5 pt-2 pb-1">
            <SheetTitle className="text-base">ثبت خرابی جدید</SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-6 overflow-y-auto flex-1">
            <FaultForm onClose={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
