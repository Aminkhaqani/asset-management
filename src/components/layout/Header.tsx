'use client'

import { Bell, Moon, Sun, Menu, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { useRef, useSyncExternalStore } from 'react'
import { toPersianNumber } from '@/lib/persian'

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { navigate, unreadNotifications, setSidebarOpen } = useAppStore()
  const mounted = useMounted()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-sm font-bold hidden sm:block">سامانه مدیریت دارایی</h1>
          <h1 className="text-sm font-bold sm:hidden">مدیریت دارایی</h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('notifications')}>
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-0.5 -left-0.5 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
              {toPersianNumber(unreadNotifications)}
            </span>
          )}
        </Button>
        {mounted && (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </header>
  )
}
