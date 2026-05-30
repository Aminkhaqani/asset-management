import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

async function seedDatabase() {
  try {
    // Check if data already exists - skip seeding if DB has data
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      return { success: true, message: 'دیتابیس قبلاً پر شده است', alreadySeeded: true }
    }

    // Users
    const admin = await db.user.create({ data: { name: 'علی محمدی', email: 'admin@asset.ir', password: 'hashed1', phone: '۰۹۱۲۱۲۳۴۵۶۷', role: 'admin', avatar: null } })
    const manager = await db.user.create({ data: { name: 'رضا احمدی', email: 'manager@asset.ir', password: 'hashed2', phone: '۰۹۱۲۲۳۴۵۶۷۸', role: 'manager', avatar: null } })
    const supervisor = await db.user.create({ data: { name: 'حسین کریمی', email: 'supervisor@asset.ir', password: 'hashed3', phone: '۰۹۱۲۳۴۵۶۷۸۹', role: 'supervisor', avatar: null } })
    const tech1 = await db.user.create({ data: { name: 'مهدی رضایی', email: 'tech1@asset.ir', password: 'hashed4', phone: '۰۹۱۲۴۵۶۷۸۹۰', role: 'technician', avatar: null } })
    const tech2 = await db.user.create({ data: { name: 'سجاد حسینی', email: 'tech2@asset.ir', password: 'hashed5', phone: '۰۹۱۲۵۶۷۸۹۰۱', role: 'technician', avatar: null } })

    // Categories
    const catChiller = await db.assetCategory.create({ data: { nameFa: 'چیلر', nameEn: 'Chiller', icon: 'Snowflake', color: '#0ea5e9', sortOrder: 1 } })
    const catBoiler = await db.assetCategory.create({ data: { nameFa: 'موتورخانه', nameEn: 'Boiler', icon: 'Flame', color: '#ef4444', sortOrder: 2 } })
    const catPump = await db.assetCategory.create({ data: { nameFa: 'پمپ', nameEn: 'Pump', icon: 'Droplets', color: '#3b82f6', sortOrder: 3 } })
    const catElec = await db.assetCategory.create({ data: { nameFa: 'برق', nameEn: 'Electrical', icon: 'Zap', color: '#eab308', sortOrder: 4 } })
    const catElev = await db.assetCategory.create({ data: { nameFa: 'آسانسور', nameEn: 'Elevator', icon: 'ArrowUpDown', color: '#8b5cf6', sortOrder: 5 } })

    // Locations
    const locB1 = await db.location.create({ data: { name: 'ساختمان اصلی', building: 'A' } })
    const locB2 = await db.location.create({ data: { name: 'ساختمان جانبی', building: 'B' } })
    const locFloorB1 = await db.location.create({ data: { name: 'زیرزمین', floor: 'B1', building: 'A', parentId: locB1.id } })
    const locFloor1 = await db.location.create({ data: { name: 'طبقه اول', floor: '1', building: 'A', parentId: locB1.id } })
    const locFloor2 = await db.location.create({ data: { name: 'طبقه دوم', floor: '2', building: 'A', parentId: locB1.id } })
    const locFloor3 = await db.location.create({ data: { name: 'طبقه سوم', floor: '3', building: 'A', parentId: locB1.id } })
    const locRoof = await db.location.create({ data: { name: 'پشت بام', floor: 'R', building: 'A', parentId: locB1.id } })
    const locMech = await db.location.create({ data: { name: 'اتاق ماشین‌آلات', floor: 'B1', building: 'A', parentId: locB1.id } })

    // Assets
    const assets = await Promise.all([
      db.asset.create({ data: { assetCode: 'CH-001', nameFa: 'چیلر تراکمی شماره ۱', nameEn: 'Compressor Chiller #1', categoryId: catChiller.id, locationId: locMech.id, brand: 'یورک', model: 'YCAJ-0450', serialNumber: 'YRK-2020-4521', installDate: new Date('2019-06-15'), capacity: '۴۵۰ تن', specifications: '{"refrigerant":"R-134a","voltage":"380V","phases":"3"}', criticality: 'critical', status: 'active', qrCode: 'QR-CH-001', notes: 'چیلر اصلی ساختمان' } }),
      db.asset.create({ data: { assetCode: 'CH-002', nameFa: 'چیلر تراکمی شماره ۲', nameEn: 'Compressor Chiller #2', categoryId: catChiller.id, locationId: locMech.id, brand: 'کاریر', model: '30XA-0500', serialNumber: 'CRR-2018-7832', installDate: new Date('2019-06-15'), capacity: '۵۰۰ تن', specifications: '{"refrigerant":"R-134a","voltage":"380V"}', criticality: 'critical', status: 'active', qrCode: 'QR-CH-002' } }),
      db.asset.create({ data: { assetCode: 'BL-001', nameFa: 'دیگ بخار شماره ۱', nameEn: 'Steam Boiler #1', categoryId: catBoiler.id, locationId: locMech.id, brand: 'بابلر', model: 'BBL-3000', serialNumber: 'BBL-2017-1200', installDate: new Date('2018-03-20'), capacity: '۳۰۰۰ کیلووات', criticality: 'critical', status: 'active', qrCode: 'QR-BL-001' } }),
      db.asset.create({ data: { assetCode: 'BL-002', nameFa: 'دیگ آبگرم شماره ۱', nameEn: 'Hot Water Boiler #1', categoryId: catBoiler.id, locationId: locMech.id, brand: 'ایران رادیاتور', model: 'IRH-2000', serialNumber: 'IRH-2019-3400', installDate: new Date('2019-06-15'), capacity: '۲۰۰۰ کیلووات', criticality: 'high', status: 'active', qrCode: 'QR-BL-002' } }),
      db.asset.create({ data: { assetCode: 'PM-001', nameFa: 'پمپ سیرکولاسیون چیلر', nameEn: 'Chiller Circulation Pump', categoryId: catPump.id, locationId: locMech.id, brand: 'لوا', model: 'LOA-CP-150', serialNumber: 'LOA-2020-5678', installDate: new Date('2019-06-15'), capacity: '۱۵۰ متر مکعب/ساعت', criticality: 'high', status: 'active', qrCode: 'QR-PM-001' } }),
      db.asset.create({ data: { assetCode: 'PM-002', nameFa: 'پمپ booster آب شهری', nameEn: 'Booster Pump', categoryId: catPump.id, locationId: locFloorB1.id, brand: 'گراندفوس', model: 'GF-BST-200', serialNumber: 'GF-2020-9012', installDate: new Date('2020-01-10'), capacity: '۲۰۰ لیتر/دقیقه', criticality: 'medium', status: 'active', qrCode: 'QR-PM-002' } }),
      db.asset.create({ data: { assetCode: 'PM-003', nameFa: 'پمپ فاضلاب', nameEn: 'Sewage Pump', categoryId: catPump.id, locationId: locFloorB1.id, brand: 'لوا', model: 'LOA-SP-100', serialNumber: 'LOA-2019-3456', installDate: new Date('2019-06-15'), criticality: 'medium', status: 'faulty', qrCode: 'QR-PM-003', notes: 'نشتی از مکانیکال سیل' } }),
      db.asset.create({ data: { assetCode: 'EL-001', nameFa: 'تابلو برق اصلی', nameEn: 'Main Electrical Panel', categoryId: catElec.id, locationId: locMech.id, brand: 'زنگان', model: 'ZNG-MDP-4000', serialNumber: 'ZNG-2019-1001', installDate: new Date('2019-05-01'), criticality: 'critical', status: 'active', qrCode: 'QR-EL-001' } }),
      db.asset.create({ data: { assetCode: 'EL-002', nameFa: 'ژنراتور اضطراری', nameEn: 'Emergency Generator', categoryId: catElec.id, locationId: locFloorB1.id, brand: 'پرکینز', model: 'PRK-500KVA', serialNumber: 'PRK-2020-2002', installDate: new Date('2020-03-15'), capacity: '۵۰۰ کیلوولت آمپر', criticality: 'high', status: 'under_maintenance', qrCode: 'QR-EL-002' } }),
      db.asset.create({ data: { assetCode: 'EL-003', nameFa: 'UPS اتاق سرور', nameEn: 'Server Room UPS', categoryId: catElec.id, locationId: locFloor2.id, brand: 'APC', model: 'APC-SRT-10K', serialNumber: 'APC-2021-3003', installDate: new Date('2021-02-10'), capacity: '۱۰ کیلوولت آمپر', criticality: 'high', status: 'active', qrCode: 'QR-EL-003' } }),
      db.asset.create({ data: { assetCode: 'EV-001', nameFa: 'آسانسور مسافربری شماره ۱', nameEn: 'Passenger Elevator #1', categoryId: catElev.id, locationId: locFloor1.id, brand: 'ایران آسانسور', model: 'IRA-800', serialNumber: 'IRA-2019-4001', installDate: new Date('2019-06-01'), capacity: '۸ نفره', criticality: 'high', status: 'active', qrCode: 'QR-EV-001' } }),
      db.asset.create({ data: { assetCode: 'EV-002', nameFa: 'آسانسور باربری', nameEn: 'Freight Elevator', categoryId: catElev.id, locationId: locFloor1.id, brand: 'ایران آسانسور', model: 'IRA-2000', serialNumber: 'IRA-2019-4002', installDate: new Date('2019-06-01'), capacity: '۲۰۰۰ کیلوگرم', criticality: 'medium', status: 'active', qrCode: 'QR-EV-002' } }),
      db.asset.create({ data: { assetCode: 'EV-003', nameFa: 'آسانسور مسافربری شماره ۲', nameEn: 'Passenger Elevator #2', categoryId: catElev.id, locationId: locFloor3.id, brand: 'سابکو', model: 'SBK-800', serialNumber: 'SBK-2020-4003', installDate: new Date('2020-09-15'), capacity: '۸ نفره', criticality: 'high', status: 'faulty', qrCode: 'QR-EV-003' } }),
      db.asset.create({ data: { assetCode: 'CH-003', nameFa: 'چیلر هوایی', nameEn: 'Air-Cooled Chiller', categoryId: catChiller.id, locationId: locRoof.id, brand: 'دایکین', model: 'DKN-ACC-300', serialNumber: 'DKN-2021-6001', installDate: new Date('2021-04-01'), capacity: '۳۰۰ تن', criticality: 'high', status: 'active', qrCode: 'QR-CH-003' } }),
      db.asset.create({ data: { assetCode: 'PM-004', nameFa: 'پمپ گرمایشی', nameEn: 'Heating Pump', categoryId: catPump.id, locationId: locMech.id, brand: 'لوا', model: 'LOA-HP-200', serialNumber: 'LOA-2019-7800', installDate: new Date('2019-06-15'), capacity: '۲۰۰ متر مکعب/ساعت', criticality: 'medium', status: 'active', qrCode: 'QR-PM-004' } }),
    ])

    // Inspections
    const now = new Date()
    const yesterday = new Date(now.getTime() - 86400000)
    const twoDaysAgo = new Date(now.getTime() - 172800000)
    const threeDaysAgo = new Date(now.getTime() - 259200000)
    const weekAgo = new Date(now.getTime() - 604800000)

    await Promise.all([
      db.inspection.create({ data: { assetId: assets[0].id, inspectorId: tech1.id, date: now, shift: 'morning', status: 'normal', readings: '{"temperature":6.5,"pressure":12.3}', runningHours: 15420, oilLevel: 'normal', vibration: 'normal', noise: 'normal', faultAlarms: '[]', notes: 'وضعیت عادی، دمای آب خنک‌کننده نرمال' } }),
      db.inspection.create({ data: { assetId: assets[1].id, inspectorId: tech2.id, date: now, shift: 'morning', status: 'warning', readings: '{"temperature":9.2,"pressure":11.8}', runningHours: 12350, oilLevel: 'low', vibration: 'normal', noise: 'abnormal', faultAlarms: '["low_oil"]', notes: 'سطح روغن پایین، صدای غیرطبیعی از کمپرسور' } }),
      db.inspection.create({ data: { assetId: assets[2].id, inspectorId: tech1.id, date: yesterday, shift: 'afternoon', status: 'normal', readings: '{"temperature":85,"pressure":3.5}', runningHours: 28900, oilLevel: 'normal', vibration: 'normal', noise: 'normal', faultAlarms: '[]' } }),
      db.inspection.create({ data: { assetId: assets[4].id, inspectorId: tech2.id, date: yesterday, shift: 'morning', status: 'warning', readings: '{"temperature":55,"pressure":4.2}', runningHours: 14200, oilLevel: 'normal', vibration: 'abnormal', noise: 'normal', faultAlarms: '[]', notes: 'لرزش غیرطبیعی در یاتاقان' } }),
      db.inspection.create({ data: { assetId: assets[6].id, inspectorId: tech1.id, date: twoDaysAgo, shift: 'night', status: 'critical', readings: '{"temperature":72,"pressure":2.1}', runningHours: 9800, oilLevel: 'critical', vibration: 'abnormal', noise: 'abnormal', faultAlarms: '["leakage","overheat"]', notes: 'نشتی شدید از مکانیکال سیل' } }),
      db.inspection.create({ data: { assetId: assets[7].id, inspectorId: tech2.id, date: threeDaysAgo, shift: 'morning', status: 'normal', readings: '{"temperature":32,"voltage":380}', runningHours: null, oilLevel: null, vibration: null, noise: null, faultAlarms: '[]' } }),
      db.inspection.create({ data: { assetId: assets[10].id, inspectorId: tech1.id, date: weekAgo, shift: 'afternoon', status: 'normal', readings: '{"temperature":25,"battery":98}', runningHours: 5600, oilLevel: null, vibration: null, noise: 'normal', faultAlarms: '[]' } }),
    ])

    // Faults
    const fault1 = await db.fault.create({ data: { assetId: assets[6].id, reportedById: tech1.id, faultType: 'mechanical', priority: 'critical', status: 'in_progress', description: 'نشتی شدید از مکانیکال سیل پمپ فاضلاب. نیاز به تعویض فوری مکانیکال سیل و یاتاقان.', reportedAt: twoDaysAgo, photos: null } })
    const fault2 = await db.fault.create({ data: { assetId: assets[1].id, reportedById: tech2.id, faultType: 'mechanical', priority: 'high', status: 'open', description: 'صدای غیرطبیعی و لرزش از کمپرسور چیلر شماره ۲. احتمال خرابی یاتاقان.', reportedAt: yesterday } })
    const fault3 = await db.fault.create({ data: { assetId: assets[12].id, reportedById: tech1.id, faultType: 'electrical', priority: 'high', status: 'open', description: 'آسانسور شماره ۲ متوقف شده و خطای E03 نمایش داده می‌شود. مشکل احتمالی در سیستم کنترل.', reportedAt: yesterday } })
    const fault4 = await db.fault.create({ data: { assetId: assets[8].id, reportedById: supervisor.id, faultType: 'control', priority: 'medium', status: 'in_progress', description: 'ژنراتور اضطراری در تست هفتگی روشن نشد. مشکل در سیستم کنترل خودکار.', reportedAt: threeDaysAgo } })
    const fault5 = await db.fault.create({ data: { assetId: assets[0].id, reportedById: tech2.id, faultType: 'hydraulic', priority: 'low', status: 'resolved', description: 'نشتی جزئی از شیر تخلیه چیلر شماره ۱', reportedAt: weekAgo, resolvedAt: threeDaysAgo, resolution: 'تعویض واشر شیر تخلیه' } })

    // Work Orders
    const wo1 = await db.workOrder.create({ data: { type: 'corrective', assetId: assets[6].id, faultId: fault1.id, title: 'تعویض مکانیکال سیل پمپ فاضلاب', description: 'تعویض مکانیکال سیل و یاتاقان پمپ فاضلاب', priority: 'critical', status: 'in_progress', assignedToId: tech1.id, startedAt: twoDaysAgo, partsConsumed: '["مکانیکال سیل ۶۰mm","یاتاقان ۶۳۰۷"]', notes: 'قطعات در انبار موجود است' } })
    const wo2 = await db.workOrder.create({ data: { type: 'corrective', assetId: assets[8].id, faultId: fault4.id, title: 'بازرسی و تعمیر سیستم کنترل ژنراتور', description: 'عیب‌یابی و تعمیر سیستم کنترل خودکار ژنراتور', priority: 'medium', status: 'assigned', assignedToId: tech2.id, scheduledDate: new Date(now.getTime() + 86400000) } })
    const wo3 = await db.workOrder.create({ data: { type: 'preventive', assetId: assets[0].id, title: 'سرویس دوره‌ای چیلر شماره ۱', description: 'سرویس فصلی چیلر شامل بررسی کمپرسور، تبخیرکننده و میعان‌کننده', priority: 'high', status: 'pending', scheduledDate: new Date(now.getTime() + 172800000), recurrence: 'quarterly', nextDueDate: new Date(now.getTime() + 172800000) } })
    const wo4 = await db.workOrder.create({ data: { type: 'preventive', assetId: assets[2].id, title: 'سرویس سالانه دیگ بخار', description: 'بازرسی و سرویس سالانه دیگ بخار شامل هیدروتست', priority: 'critical', status: 'completed', assignedToId: tech1.id, approvedById: manager.id, scheduledDate: weekAgo, startedAt: weekAgo, completedAt: threeDaysAgo, approvedAt: twoDaysAgo, notes: 'هیدروتست با موفقیت انجام شد' } })
    const wo5 = await db.workOrder.create({ data: { type: 'preventive', assetId: assets[10].id, title: 'نگهداری ماهانه آسانسور', description: 'نگهداری ماهانه آسانسور شامل بررسی کابل، ترمز و سیستم کنترل', priority: 'medium', status: 'overdue', assignedToId: tech2.id, scheduledDate: threeDaysAgo, recurrence: 'monthly', nextDueDate: new Date(now.getTime() - 259200000) } })

    // Checklists
    await Promise.all([
      db.checklist.create({ data: { assetId: assets[0].id, title: 'چک‌لیست بازدید روزانه چیلر', type: 'inspection', frequency: 'daily', items: '["بررسی دمای آب خروجی","بررسی فشار مبرد","بررسی سطح روغن کمپرسور","بررسی صدای غیرطبیعی","بررسی لرزش","بررسی نشتی"]', lastDoneAt: now, nextDueAt: new Date(now.getTime() + 86400000) } }),
      db.checklist.create({ data: { assetId: assets[2].id, title: 'چک‌لیست بازدید روزانه دیگ بخار', type: 'inspection', frequency: 'daily', items: '["بررسی فشار بخار","بررسی سطح آب","بررسی شعله مشعل","بررسی صدای غیرطبیعی","بررسی دود خروجی","بررسی سیستم ایمنی"]', lastDoneAt: yesterday, nextDueAt: now } }),
      db.checklist.create({ data: { assetId: assets[10].id, title: 'چک‌لیست نگهداری ماهانه آسانسور', type: 'pm', frequency: 'monthly', items: '["بررسی کابل‌ها","بررسی ترمز","بررسی سیستم کنترل","آزمایش حدswitchها","بررسی چراغ‌های کابین","بررسی دنده‌ها"]', lastDoneAt: weekAgo, nextDueAt: new Date(now.getTime() - 259200000) } }),
      db.checklist.create({ data: { assetId: assets[8].id, title: 'چک‌لیست تست هفتگی ژنراتور', type: 'inspection', frequency: 'weekly', items: '["تست روشن شدن خودکار","بررسی سطح سوخت","بررسی سطح روغن","بررسی باتری","بررسی خنک‌کننده"]', lastDoneAt: threeDaysAgo, nextDueAt: yesterday } }),
      db.checklist.create({ data: { assetId: assets[7].id, title: 'چک‌لیست بازرسی فصلی تابلو برق', type: 'pm', frequency: 'quarterly', items: '["بررسی اتصالات","بررسی حرارت کنتاکتورها","تست محافظ‌ها","بررسی سیم‌کشی‌ها","اندازه‌گیری مقاومت عایقی"]', lastDoneAt: new Date(now.getTime() - 7776000000), nextDueAt: new Date(now.getTime() + 2592000000) } }),
    ])

    // Timeline Events
    await Promise.all([
      db.timelineEvent.create({ data: { assetId: assets[0].id, eventType: 'inspection', title: 'بازدید روزانه', description: 'بازدید صبحی - وضعیت عادی', performedBy: tech1.name, eventDate: now, relatedType: 'inspection' } }),
      db.timelineEvent.create({ data: { assetId: assets[1].id, eventType: 'fault', title: 'ثبت خرابی', description: 'صدای غیرطبیعی از کمپرسور', performedBy: tech2.name, eventDate: yesterday, relatedId: fault2.id, relatedType: 'fault' } }),
      db.timelineEvent.create({ data: { assetId: assets[6].id, eventType: 'fault', title: 'ثبت خرابی بحرانی', description: 'نشتی شدید مکانیکال سیل', performedBy: tech1.name, eventDate: twoDaysAgo, relatedId: fault1.id, relatedType: 'fault' } }),
      db.timelineEvent.create({ data: { assetId: assets[6].id, eventType: 'maintenance', title: 'شروع تعمیرات', description: 'تعویض مکانیکال سیل و یاتاقان آغاز شد', performedBy: tech1.name, eventDate: twoDaysAgo, relatedId: wo1.id, relatedType: 'workorder' } }),
      db.timelineEvent.create({ data: { assetId: assets[2].id, eventType: 'maintenance', title: 'تکمیل سرویس سالانه', description: 'سرویس سالانه دیگ بخار تکمیل و تأیید شد', performedBy: tech1.name, eventDate: threeDaysAgo, relatedId: wo4.id, relatedType: 'workorder' } }),
      db.timelineEvent.create({ data: { assetId: assets[12].id, eventType: 'fault', title: 'خرابی آسانسور', description: 'توقف آسانسور و خطای E03', performedBy: tech1.name, eventDate: yesterday, relatedId: fault3.id, relatedType: 'fault' } }),
      db.timelineEvent.create({ data: { assetId: assets[0].id, eventType: 'repair', title: 'رفع نشتی شیر تخلیه', description: 'تعویض واشر شیر تخلیه چیلر', performedBy: tech2.name, eventDate: threeDaysAgo, relatedId: fault5.id, relatedType: 'fault' } }),
      db.timelineEvent.create({ data: { assetId: assets[8].id, eventType: 'shutdown', title: 'خروج از سرویس', description: 'ژنراتور برای تعمیرات از سرویس خارج شد', performedBy: supervisor.name, eventDate: threeDaysAgo, relatedId: wo2.id, relatedType: 'workorder' } }),
    ])

    // Notifications
    await Promise.all([
      db.notification.create({ data: { userId: admin.id, title: 'خرابی بحرانی', message: 'نشتی شدید از مکانیکال سیل پمپ فاضلاب (PM-003)', type: 'fault', relatedId: fault1.id, relatedType: 'fault' } }),
      db.notification.create({ data: { userId: admin.id, title: 'دستور کار جدید', message: 'تعویض مکانیکال سیل پمپ فاضلاب به مهدی رضایی اختصاص یافت', type: 'assignment', relatedId: wo1.id, relatedType: 'workorder' } }),
      db.notification.create({ data: { userId: manager.id, title: 'تأیید درخواست', message: 'سرویس سالانه دیگ بخار تکمیل شد و نیازمند تأیید شماست', type: 'approval', relatedId: wo4.id, relatedType: 'workorder' } }),
      db.notification.create({ data: { userId: tech1.id, title: 'نگهداری تأخیر یافته', message: 'نگهداری ماهانه آسانسور سررسید شده است', type: 'pm_overdue', relatedId: wo5.id, relatedType: 'workorder' } }),
      db.notification.create({ data: { userId: tech2.id, title: 'اختصاص کار', message: 'بازرسی و تعمیر سیستم کنترل ژنراتور به شما اختصاص یافت', type: 'assignment', relatedId: wo2.id, relatedType: 'workorder' } }),
      db.notification.create({ data: { userId: admin.id, title: 'خرابی جدید', message: 'توقف آسانسور شماره ۲ با خطای E03', type: 'fault', relatedId: fault3.id, relatedType: 'fault' } }),
    ])

    return { success: true, message: 'داده‌های نمونه با موفقیت ایجاد شدند' }
  } catch (error) {
    console.error('Seed error:', error)
    return { success: false, error: String(error) }
  }
}

export async function POST() {
  const result = await seedDatabase()
  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }
  return NextResponse.json(result)
}

export async function GET() {
  const result = await seedDatabase()
  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }
  if (!result.alreadySeeded) {
    return new Response(`
      <html>
        <head><meta charset="utf-8"><title>راه‌اندازی دیتابیس</title></head>
        <body style="font-family: Vazirmatn, sans-serif; direction: rtl; text-align: center; padding-top: 100px; background: #0f172a; color: #e2e8f0;">
          <h1 style="color: #14b8a6;">دیتابیس با موفقیت پر شد!</h1>
          <p>داده‌های نمونه وارد شدند. در حال انتقال به داشبورد...</p>
          <script>setTimeout(() => window.location.href = '/', 2000)</script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
  return NextResponse.json(result)
}
