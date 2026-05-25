'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { roleLabels, toPersianNumber } from '@/lib/persian'
import { Users, Phone, Mail, Shield } from 'lucide-react'

export function UserList() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    manager: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    supervisor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    technician: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">کاربران</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user: any) => (
            <Card key={user.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-lg">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs border-0 ${roleColors[user.role] || ''}`}>
                        <Shield className="h-3 w-3 ml-1" />
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span dir="ltr">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
