'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toPersianNumber, notificationTypeLabels, formatRelativeTime } from '@/lib/persian'
import { Badge } from '@/components/ui/badge'
import { Bell, Check } from 'lucide-react'
import { toast } from 'sonner'

export function NotificationList() {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true, userId: 'all' }) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('همه اعلان‌ها خوانده شد')
    },
  })

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">اعلان‌ها</h2>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
            <Check className="h-4 w-4 ml-1" />
            خواندن همه
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>اعلانی وجود ندارد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif: any) => (
            <Card
              key={notif.id}
              className={`border-0 shadow-sm cursor-pointer transition-colors ${!notif.isRead ? 'bg-teal-50/50 dark:bg-teal-900/10 border-r-4 border-r-teal-500' : ''}`}
              onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    {notificationTypeLabels[notif.type] || notif.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
