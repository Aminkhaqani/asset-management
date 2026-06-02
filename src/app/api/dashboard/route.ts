import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      totalAssets,
      activeFaults,
      assetsDown,
      overduePM,
      todayInspections,
      openWorkOrders,
      recentFaults,
      assetByCategory,
      recentTimeline,
    ] = await Promise.all([
      db.asset.count(),
      db.fault.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      db.asset.count({ where: { status: { in: ['faulty', 'under_maintenance'] } } }),
      db.workOrder.count({ where: { type: 'preventive', status: { in: ['pending', 'overdue'] }, nextDueDate: { lte: new Date() } } }),
      db.inspection.count({ where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      db.workOrder.count({ where: { status: { in: ['pending', 'assigned', 'in_progress'] } } }),
      db.fault.findMany({ where: { status: { in: ['open', 'in_progress'] } }, include: { asset: true }, orderBy: { reportedAt: 'desc' }, take: 10 }),
      db.assetCategory.findMany({ include: { _count: { select: { assets: true } }, assets: { include: { faults: { where: { status: { in: ['open', 'in_progress'] } } } } } } }),
      db.timelineEvent.findMany({ orderBy: { eventDate: 'desc' }, take: 10, include: { asset: { select: { nameFa: true, assetCode: true, id: true } } } }),
    ])

    const availableAssets = totalAssets - assetsDown
    const availabilityPercent = totalAssets > 0 ? Math.round((availableAssets / totalAssets) * 100) : 0

    const faultByCategory = assetByCategory.map(cat => ({
      name: cat.nameFa,
      total: cat._count.assets,
      faults: cat.assets.reduce((sum, a) => sum + a.faults.length, 0),
    }))

    const mostProblematic = await db.asset.findMany({
      where: { faults: { some: { status: { in: ['open', 'in_progress'] } } } },
      include: { category: true, location: true, _count: { select: { faults: true } } },
      orderBy: { faults: { _count: 'desc' } },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        totalAssets,
        activeFaults,
        assetsDown,
        overduePM,
        todayInspections,
        openWorkOrders,
        availabilityPercent,
      },
      faultByCategory,
      mostProblematic,
      recentFaults,
      recentTimeline,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
