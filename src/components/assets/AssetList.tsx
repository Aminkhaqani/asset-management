'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { AssetCard } from './AssetCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Plus, Filter, HardHat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AssetForm } from './AssetForm'
import { assetTypeDefinitions } from '@/lib/asset-types'

export function AssetList() {
  const navigate = useAppStore((s) => s.navigate)
  const navigationFilters = useAppStore((s) => s.navigationFilters)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(navigationFilters.categoryId ?? '')
  const [assetType, setAssetType] = useState('')
  const [status, setStatus] = useState(navigationFilters.status ?? '')
  const [criticality, setCriticality] = useState(navigationFilters.criticality ?? '')
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(Object.keys(navigationFilters).length > 0)

  // Apply navigation filters from dashboard on mount
  useEffect(() => {
    if (Object.keys(navigationFilters).length > 0) {
      clearFilters()
    }
  }, [clearFilters, navigationFilters])

  const { data: assetsResponse = [], isLoading } = useQuery({
    queryKey: ['assets', search, categoryId, assetType, status, criticality],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryId) params.set('categoryId', categoryId)
      if (assetType) params.set('assetType', assetType)
      if (status) params.set('status', status)
      if (criticality) params.set('criticality', criticality)
      return fetch(`/api/assets?${params}`).then(r => r.json())
    },
  })

  const assets = Array.isArray(assetsResponse) ? assetsResponse : []

  const { data: categoriesResponse = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
  })

  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : []

  const { data: locationsResponse = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => fetch('/api/locations').then(r => r.json()),
  })

  const locations = Array.isArray(locationsResponse) ? locationsResponse : []

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Select value={assetType} onValueChange={(v) => setAssetType(v === '__all__' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="نوع دارایی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">همه</SelectItem>
              {assetTypeDefinitions.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Add Asset Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base">افزودن دارایی جدید</DialogTitle>
          </DialogHeader>
          <AssetForm categories={categories} locations={locations} onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
