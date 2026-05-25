'use client'

import { useAppStore, type PageId } from '@/store/useAppStore'
import {
  LayoutDashboard,
  HardHat,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  CheckSquare,
  Bell,
  Users,
  Settings,
  X,
  ScanLine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const mainMenuItems: { id: PageId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'assets', label: 'دارایی‌ها', icon: HardHat },
  { id: 'inspections', label: 'بازدیدها', icon: ClipboardCheck },
  { id: 'maintenance', label: 'نگهداری و تعمیرات', icon: Wrench },
  { id: 'faults', label: 'خرابی‌ها', icon: AlertTriangle },
  { id: 'checklists', label: 'چک‌لیست‌ها', icon: CheckSquare },
  { id: 'scan-qr', label: 'اسکن QR', icon: ScanLine },
]

const systemMenuItems: { id: PageId; label: string; icon: React.ElementType }[] = [
  { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
]

export function Sidebar() {
  const { currentPage, navigate, sidebarOpen, setSidebarOpen } = useAppStore()

  const handleNav = (page: PageId) => {
    navigate(page)
    setSidebarOpen(false)
  }

  const isActive = (id: PageId) => {
    if (id === 'assets' && (currentPage === 'asset-detail')) return true
    if (id === 'inspections' && currentPage === 'inspection-form') return true
    if (id === 'maintenance' && (currentPage === 'work-order-detail' || currentPage === 'work-order-form')) return true
    if (id === 'faults' && (currentPage === 'fault-detail' || currentPage === 'fault-form')) return true
    if (id === 'checklists' && currentPage === 'checklist-detail') return true
    return currentPage === id
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <h2 className="font-bold">منو</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-3.5rem)]">
              <nav className="p-3 space-y-1">
                {mainMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive(item.id)
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 font-medium'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <Separator className="my-3" />
                {systemMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive(item.id)
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 font-medium'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 border-l bg-card shrink-0">
        <div className="flex items-center gap-2 h-14 px-4 border-b">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm">سامانه مدیریت دارایی</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive(item.id)
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 font-medium'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
            <Separator className="my-3" />
            {systemMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive(item.id)
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 font-medium'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
