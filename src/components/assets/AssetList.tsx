'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { AssetCard } from './AssetCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Search, Plus, Filter, HardHat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AssetForm } from './AssetForm'

export function AssetList() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [criticality, setCriticality] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Apply navigation filters from dashboard on mount
  useEffect(() => {
    if (navigationFilters.status) {
      setStatus(navigationFilters.status)
      setShowFilters(true)
    }
    if (navigationFilters.criticality) {
      setCriticality(navigationFilters.criticality)
      setShowFilters(true)
    }
    if (navigationFilters.categoryId) {
      setCategoryId(navigationFilters.categoryId)
      setShowFilters(true)
    }
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets', search, categoryId, status, criticality],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryId) params.set('categoryId', categoryId)
      if (status) params.set('status', status)
      if (criticality) params.set('criticality', criticality)
      return fetch(`/api/assets?${params}`).then(r => r.json())
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
  })

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => fetch('/api/locations').then(r => r.json()),
  })

  return (
    <div className="p-4 space-y-4">
      {/* Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی دارایی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" />
        </Button>
        <Button size="icon" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="دسته‌بندی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nameFa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="وضعیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="faulty">خراب</SelectItem>
              <SelectItem value="under_maintenance">در تعمیر</SelectItem>
              <SelectItem value="retired">بازنشسته</SelectItem>
            </SelectContent>
          </Select>
          <Select value={criticality} onValueChange={(v) => setCriticality(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="اهمیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              <SelectItem value="low">کم</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="high">زیاد</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Asset List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HardHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>دارایی‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset: any) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Add Asset Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader className="px-5 pt-2 pb-1">
            <SheetTitle className="text-base">افزودن دارایی جدید</SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-6 overflow-y-auto flex-1">
            <AssetForm categories={categories} locations={locations} onClose={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
