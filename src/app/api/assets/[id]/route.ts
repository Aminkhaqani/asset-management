import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        attachments: true,
        inspections: { include: { inspector: true }, orderBy: { date: 'desc' }, take: 10 },
        faults: { include: { reportedBy: true }, orderBy: { reportedAt: 'desc' }, take: 10 },
        workOrders: { include: { assignedTo: true }, orderBy: { createdAt: 'desc' }, take: 10 },
        timeline: { orderBy: { eventDate: 'desc' }, take: 20 },
        checklists: { where: { isActive: true } },
        pmPlans: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    return NextResponse.json(asset)
  } catch (error) {
    console.error('Asset detail error:', error)
    return NextResponse.json({ error: 'Failed to load asset' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const asset = await db.asset.update({ where: { id }, data: body })
    return NextResponse.json(asset)
  } catch (error) {
    console.error('Update asset error:', error)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.asset.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
