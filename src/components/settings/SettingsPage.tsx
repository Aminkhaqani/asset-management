'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Moon, Sun, Palette, Bell, Shield } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSyncExternalStore } from 'react'

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">تنظیمات</h2>

      {/* Profile Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xl">
                ع
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">علی محمدی</p>
              <Badge variant="outline" className="text-xs mt-1">
                <Shield className="h-3 w-3 ml-1" />
                مدیر سیستم
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">admin@asset.ir</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            ظاهر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mounted && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Label>حالت تاریک</Label>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            اعلان‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>اعلان خرابی‌ها</Label>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label>اعلان نگهداری تأخیری</Label>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label>اعلان اختصاص کار</Label>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">درباره سامانه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>سامانه مدیریت دارایی</p>
          <p>نسخه ۱.۰.۰</p>
        </CardContent>
      </Card>
    </div>
  )
}
