'use client'

import { Inbox } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title, description }: { icon?: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="h-16 w-16 mb-4 opacity-30" />
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  )
}
