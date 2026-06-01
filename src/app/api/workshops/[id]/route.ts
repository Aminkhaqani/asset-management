import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const workshop = await db.workshop.findUnique({
      where: { id },
      include: {
        workOrders: {
          include: {
            asset: { select: { nameFa: true, assetCode: true } },
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { workOrders: true } },
      },
    })
    if (!workshop) return NextResponse.json({ error: 'Workshop not found' }, { status: 404 })
    return NextResponse.json(workshop)
  } catch (error) {
    console.error('Workshop detail error:', error)
    return NextResponse.json({ error: 'Failed to load workshop' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const workshop = await db.workshop.update({ where: { id }, data: body })
    return NextResponse.json(workshop)
  } catch (error) {
    console.error('Update workshop error:', error)
    return NextResponse.json({ error: 'Failed to update workshop' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Check for active work orders before deleting
    const activeWorkOrders = await db.workOrder.count({
      where: { workshopId: id, status: { in: ['pending', 'assigned', 'in_progress'] } },
    })
    if (activeWorkOrders > 0) {
      return NextResponse.json(
        { error: 'این تعمیرگاه دارای دستور کار فعال است و قابل حذف نیست' },
        { status: 400 }
      )
    }
    await db.workshop.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete workshop error:', error)
    return NextResponse.json({ error: 'Failed to delete workshop' }, { status: 500 })
  }
}
