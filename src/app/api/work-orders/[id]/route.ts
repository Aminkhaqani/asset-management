import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const wo = await db.workOrder.findUnique({
      where: { id },
      include: {
        asset: { include: { category: true, location: true } },
        assignedTo: true,
        approvedBy: true,
        fault: true,
      },
    })
    if (!wo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(wo)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const wo = await db.workOrder.update({ where: { id }, data: body })

    // If work order completed and asset has no other open work orders, set to active
    if (body.status === 'completed' || body.status === 'approved') {
      const otherWOs = await db.workOrder.count({
        where: { assetId: wo.assetId, status: { in: ['pending', 'assigned', 'in_progress'] }, id: { not: id } }
      })
      const otherFaults = await db.fault.count({
        where: { assetId: wo.assetId, status: { in: ['open', 'in_progress'] } }
      })
      if (otherWOs === 0 && otherFaults === 0) {
        await db.asset.update({ where: { id: wo.assetId }, data: { status: 'active' } })
      }
    }

    return NextResponse.json(wo)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
