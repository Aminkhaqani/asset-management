import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const assetId = searchParams.get('assetId') || ''
    const assetType = searchParams.get('assetType') || ''
    const assignedToId = searchParams.get('assignedToId') || ''
    const priority = searchParams.get('priority') || ''
    const repairType = searchParams.get('repairType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status
    if (assetId) where.assetId = assetId
    if (assetType) where.asset = { is: { assetType } }
    if (assignedToId) where.assignedToId = assignedToId
    if (priority) where.priority = priority
    if (repairType) where.repairType = repairType
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
      }
    }

    const workOrders = await db.workOrder.findMany({
      where,
      include: {
        asset: { select: { nameFa: true, assetCode: true, assetType: true } },
        assignedTo: { select: { id: true, name: true } },
        fault: { select: { id: true, faultType: true, priority: true } },
        workshop: { select: { id: true, name: true, code: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(workOrders)
  } catch (error) {
    console.error('Work orders error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const wo = await db.workOrder.create({ data: body })
    
    // Create timeline event
    await db.timelineEvent.create({
      data: {
        assetId: body.assetId,
        eventType: 'maintenance',
        title: body.type === 'preventive' ? 'دستور کار نگهداری پیشگیرانه' : 'دستور کار تعمیرات',
        description: body.title,
        performedBy: body.assignedToId,
        relatedId: wo.id,
        relatedType: 'workorder',
      }
    })

    return NextResponse.json(wo, { status: 201 })
  } catch (error) {
    console.error('Create work order error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
