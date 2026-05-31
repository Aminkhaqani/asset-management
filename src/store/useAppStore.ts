import { create } from 'zustand'

export type PageId = 
  | 'dashboard' 
  | 'assets' 
  | 'asset-detail' 
  | 'inspections' 
  | 'inspection-form'
  | 'maintenance' 
  | 'work-order-detail'
  | 'work-order-form'
  | 'faults' 
  | 'fault-detail'
  | 'fault-form'
  | 'checklists' 
  | 'checklist-detail'
  | 'workshops'
  | 'notifications' 
  | 'users' 
  | 'settings'
  | 'scan-qr'

interface AppState {
  currentPage: PageId
  selectedAssetId: string | null
  selectedFaultId: string | null
  selectedWorkOrderId: string | null
  selectedChecklistId: string | null
  sidebarOpen: boolean
  unreadNotifications: number
  
  navigate: (page: PageId, params?: { 
    assetId?: string
    faultId?: string
    workOrderId?: string
    checklistId?: string
  }) => void
  setSidebarOpen: (open: boolean) => void
  setUnreadNotifications: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  selectedAssetId: null,
  selectedFaultId: null,
  selectedWorkOrderId: null,
  selectedChecklistId: null,
  sidebarOpen: false,
  unreadNotifications: 0,

  navigate: (page, params = {}) => set({
    currentPage: page,
    selectedAssetId: params.assetId ?? null,
    selectedFaultId: params.faultId ?? null,
    selectedWorkOrderId: params.workOrderId ?? null,
    selectedChecklistId: params.checklistId ?? null,
    sidebarOpen: false,
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}))
