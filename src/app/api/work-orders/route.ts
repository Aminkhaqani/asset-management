import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const assetId = searchParams.get('assetId') || ''

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status
    if (assetId) where.assetId = assetId

    const workOrders = await db.workOrder.findMany({
      where,
      include: {
        asset: { select: { nameFa: true, assetCode: true } },
        assignedTo: { select: { name: true } },
        fault: { select: { id: true, faultType: true, priority: true } },
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
