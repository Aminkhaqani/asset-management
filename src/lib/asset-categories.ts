import type { AssetType } from '@/lib/asset-types'

export type AssetCategoryDefinition = {
  key: string
  assetType: AssetType
  nameFa: string
  nameEn: string
  icon: string
  color: string
  sortOrder: number
}

export const assetCategoryDefinitions: AssetCategoryDefinition[] = [
  { key: 'equipment_chiller', assetType: 'equipment', nameFa: 'چیلر', nameEn: 'Chiller', icon: 'Snowflake', color: '#0ea5e9', sortOrder: 10 },
  { key: 'equipment_boiler', assetType: 'equipment', nameFa: 'موتورخانه/دیگ', nameEn: 'Boiler', icon: 'Flame', color: '#ef4444', sortOrder: 20 },
  { key: 'equipment_pump', assetType: 'equipment', nameFa: 'پمپ', nameEn: 'Pump', icon: 'Droplets', color: '#3b82f6', sortOrder: 30 },
  { key: 'equipment_electrical', assetType: 'equipment', nameFa: 'برق و تابلو', nameEn: 'Electrical', icon: 'Zap', color: '#eab308', sortOrder: 40 },
  { key: 'equipment_elevator', assetType: 'equipment', nameFa: 'آسانسور/بالابر', nameEn: 'Elevator', icon: 'ArrowUpDown', color: '#8b5cf6', sortOrder: 50 },
  { key: 'equipment_hvac', assetType: 'equipment', nameFa: 'هواساز و تهویه', nameEn: 'HVAC', icon: 'Fan', color: '#06b6d4', sortOrder: 60 },
  { key: 'equipment_fire_safety', assetType: 'equipment', nameFa: 'اعلام و اطفای حریق', nameEn: 'Fire Safety', icon: 'ShieldAlert', color: '#f97316', sortOrder: 70 },
  { key: 'equipment_plumbing', assetType: 'equipment', nameFa: 'لوله‌کشی و سیالات', nameEn: 'Plumbing', icon: 'Pipes', color: '#14b8a6', sortOrder: 80 },

  { key: 'vehicle_passenger_car', assetType: 'vehicle', nameFa: 'سواری', nameEn: 'Passenger Car', icon: 'Car', color: '#2563eb', sortOrder: 10 },
  { key: 'vehicle_pickup_van', assetType: 'vehicle', nameFa: 'وانت/ون', nameEn: 'Pickup Van', icon: 'Truck', color: '#0891b2', sortOrder: 20 },
  { key: 'vehicle_bus_minibus', assetType: 'vehicle', nameFa: 'اتوبوس/مینی‌بوس', nameEn: 'Bus Minibus', icon: 'Bus', color: '#7c3aed', sortOrder: 30 },
  { key: 'vehicle_truck', assetType: 'vehicle', nameFa: 'کامیون و کشنده', nameEn: 'Truck', icon: 'Truck', color: '#dc2626', sortOrder: 40 },
  { key: 'vehicle_motorcycle', assetType: 'vehicle', nameFa: 'موتورسیکلت', nameEn: 'Motorcycle', icon: 'Bike', color: '#ea580c', sortOrder: 50 },
  { key: 'vehicle_special', assetType: 'vehicle', nameFa: 'خودروی ویژه/عملیاتی', nameEn: 'Special Vehicle', icon: 'Siren', color: '#0f766e', sortOrder: 60 },

  { key: 'wagon_passenger', assetType: 'wagon', nameFa: 'واگن مسافری', nameEn: 'Passenger Wagon', icon: 'TrainFront', color: '#4f46e5', sortOrder: 10 },
  { key: 'wagon_freight', assetType: 'wagon', nameFa: 'واگن باری', nameEn: 'Freight Wagon', icon: 'TrainTrack', color: '#475569', sortOrder: 20 },
  { key: 'wagon_tank', assetType: 'wagon', nameFa: 'واگن مخزن', nameEn: 'Tank Wagon', icon: 'Container', color: '#0d9488', sortOrder: 30 },
  { key: 'wagon_refrigerated', assetType: 'wagon', nameFa: 'واگن یخچالی', nameEn: 'Refrigerated Wagon', icon: 'Snowflake', color: '#0284c7', sortOrder: 40 },
  { key: 'wagon_service', assetType: 'wagon', nameFa: 'واگن خدماتی/تعمیراتی', nameEn: 'Service Wagon', icon: 'Wrench', color: '#ca8a04', sortOrder: 50 },

  { key: 'chiller_air_cooled', assetType: 'chiller', nameFa: 'چیلر تراکمی هواخنک', nameEn: 'Air Cooled Chiller', icon: 'Snowflake', color: '#0ea5e9', sortOrder: 10 },
  { key: 'chiller_water_cooled', assetType: 'chiller', nameFa: 'چیلر تراکمی آب‌خنک', nameEn: 'Water Cooled Chiller', icon: 'Droplets', color: '#0284c7', sortOrder: 20 },
  { key: 'chiller_absorption', assetType: 'chiller', nameFa: 'چیلر جذبی', nameEn: 'Absorption Chiller', icon: 'Flame', color: '#f97316', sortOrder: 30 },
  { key: 'chiller_centrifugal', assetType: 'chiller', nameFa: 'چیلر سانتریفیوژ', nameEn: 'Centrifugal Chiller', icon: 'Gauge', color: '#14b8a6', sortOrder: 40 },
  { key: 'chiller_screw', assetType: 'chiller', nameFa: 'چیلر اسکرو', nameEn: 'Screw Chiller', icon: 'Settings', color: '#6366f1', sortOrder: 50 },

  { key: 'other_it', assetType: 'other', nameFa: 'دارایی فناوری اطلاعات', nameEn: 'IT Asset', icon: 'Server', color: '#64748b', sortOrder: 10 },
  { key: 'other_tooling', assetType: 'other', nameFa: 'ابزار و تجهیزات کارگاهی', nameEn: 'Tooling', icon: 'Hammer', color: '#78716c', sortOrder: 20 },
  { key: 'other_furniture', assetType: 'other', nameFa: 'اثاثیه و تجهیزات اداری', nameEn: 'Furniture', icon: 'Armchair', color: '#a855f7', sortOrder: 30 },
  { key: 'other_custom', assetType: 'other', nameFa: 'سایر', nameEn: 'Other', icon: 'Boxes', color: '#64748b', sortOrder: 90 },
]

export const getAssetCategoryDefinitions = (assetType?: string) =>
  assetType
    ? assetCategoryDefinitions.filter((category) => category.assetType === assetType)
    : assetCategoryDefinitions
