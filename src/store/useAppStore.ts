import { create } from 'zustand'

export type PageId = 
  | 'dashboard' 
  | 'assets' 
  | 'asset-detail' 
  | 'inspections' 
  | 'inspection-form'
  | 'inspection-detail'
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

interface NavigationFilters {
  status?: string
  priority?: string
  faultType?: string
  criticality?: string
  type?: string
  categoryId?: string
  assetId?: string
}

interface AppState {
  currentPage: PageId
  selectedAssetId: string | null
  selectedFaultId: string | null
  selectedWorkOrderId: string | null
  selectedChecklistId: string | null
  selectedInspectionId: string | null
  sidebarOpen: boolean
  unreadNotifications: number
  navigationFilters: NavigationFilters
  
  navigate: (page: PageId, params?: { 
    assetId?: string
    faultId?: string
    workOrderId?: string
    checklistId?: string
    inspectionId?: string
    filters?: NavigationFilters
  }) => void
  setSidebarOpen: (open: boolean) => void
  setUnreadNotifications: (count: number) => void
  clearFilters: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  selectedAssetId: null,
  selectedFaultId: null,
  selectedWorkOrderId: null,
  selectedChecklistId: null,
  selectedInspectionId: null,
  sidebarOpen: false,
  unreadNotifications: 0,
  navigationFilters: {},

  navigate: (page, params = {}) => set({
    currentPage: page,
    selectedAssetId: params.assetId ?? null,
    selectedFaultId: params.faultId ?? null,
    selectedWorkOrderId: params.workOrderId ?? null,
    selectedChecklistId: params.checklistId ?? null,
    selectedInspectionId: params.inspectionId ?? null,
    navigationFilters: params.filters ?? {},
    sidebarOpen: false,
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  clearFilters: () => set({ navigationFilters: {} }),
}))
