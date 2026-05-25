'use client'

import { useAppStore, type PageId } from '@/store/useAppStore'
import { LayoutDashboard, HardHat, ClipboardCheck, Wrench, AlertTriangle, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toPersianNumber } from '@/lib/persian'

const navItems: { id: PageId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'assets', label: 'دارایی‌ها', icon: HardHat },
  { id: 'inspections', label: 'بازدید', icon: ClipboardCheck },
  { id: 'maintenance', label: 'تعمیرات', icon: Wrench },
  { id: 'faults', label: 'خرابی', icon: AlertTriangle },
]

export function BottomNav() {
  const { currentPage, navigate, unreadNotifications } = useAppStore()

  const isActive = (id: PageId) => {
    if (id === 'assets' && currentPage === 'asset-detail') return true
    if (id === 'inspections' && currentPage === 'inspection-form') return true
    if (id === 'maintenance' && (currentPage === 'work-order-detail' || currentPage === 'work-order-form')) return true
    if (id === 'faults' && (currentPage === 'fault-detail' || currentPage === 'fault-form')) return true
    return currentPage === id
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors relative',
              isActive(item.id) ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.id === 'faults' && unreadNotifications > 0 && (
              <span className="absolute top-0 right-2 w-3.5 h-3.5 text-[8px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                {toPersianNumber(unreadNotifications)}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => navigate('scan-qr')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors',
            currentPage === 'scan-qr' ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'
          )}
        >
          <ScanLine className="h-5 w-5" />
          <span className="text-[10px] font-medium">اسکن</span>
        </button>
      </div>
    </nav>
  )
}
