import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const fault = await db.fault.findUnique({
      where: { id },
      include: {
        asset: { include: { category: true, location: true } },
        reportedBy: true,
        workOrders: { include: { assignedTo: true } },
      },
    })
    if (!fault) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(fault)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const fault = await db.fault.update({ where: { id }, data: body })
    
    if (body.status === 'resolved' || body.status === 'closed') {
      // Check if asset has other open faults
      const otherFaults = await db.fault.count({
        where: { assetId: fault.assetId, status: { in: ['open', 'in_progress'] }, id: { not: id } }
      })
      if (otherFaults === 0) {
        await db.asset.update({ where: { id: fault.assetId }, data: { status: 'active' } })
      }
    }

    return NextResponse.json(fault)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
