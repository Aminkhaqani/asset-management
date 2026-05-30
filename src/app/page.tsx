'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { AssetList } from '@/components/assets/AssetList'
import { AssetDetail } from '@/components/assets/AssetDetail'
import { ScanQRPage } from '@/components/assets/ScanQRPage'
import { InspectionList } from '@/components/inspections/InspectionList'
import { MaintenancePage } from '@/components/maintenance/MaintenancePage'
import { WorkOrderDetail } from '@/components/maintenance/WorkOrderDetail'
import { FaultList } from '@/components/faults/FaultList'
import { FaultDetail } from '@/components/faults/FaultDetail'
import { ChecklistList } from '@/components/checklists/ChecklistList'
import { ChecklistDetail } from '@/components/checklists/ChecklistDetail'
import { NotificationList } from '@/components/notifications/NotificationList'
import { UserList } from '@/components/users/UserList'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { motion, AnimatePresence } from 'framer-motion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
})

function AppContent() {
  const { currentPage } = useAppStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'assets':
        return <AssetList />
      case 'asset-detail':
        return <AssetDetail />
      case 'scan-qr':
        return <ScanQRPage />
      case 'inspections':
      case 'inspection-form':
        return <InspectionList />
      case 'maintenance':
        return <MaintenancePage />
      case 'work-order-detail':
        return <WorkOrderDetail />
      case 'work-order-form':
        return <MaintenancePage />
      case 'faults':
      case 'fault-form':
        return <FaultList />
      case 'fault-detail':
        return <FaultDetail />
      case 'checklists':
        return <ChecklistList />
      case 'checklist-detail':
        return <ChecklistDetail />
      case 'notifications':
        return <NotificationList />
      case 'users':
        return <UserList />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

function SeedLoader() {
  const [status, setStatus] = useState<'seeding' | 'ready'>('seeding')

  useEffect(() => {
    fetch('/api/seed', { method: 'POST' })
      .then(r => r.json())
      .then(() => setStatus('ready'))
      .catch(() => setStatus('ready'))
  }, [])

  if (status === 'seeding') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">در حال بارگذاری داده‌های نمونه...</p>
        </div>
      </div>
    )
  }

  return <AppContent />
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <SeedLoader />
    </QueryClientProvider>
  )
}
