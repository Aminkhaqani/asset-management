import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId') || ''
    const assetType = searchParams.get('assetType') || ''
    const reportedById = searchParams.get('reportedById') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const faultType = searchParams.get('faultType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    
    const where: Record<string, unknown> = {}
    if (assetId) where.assetId = assetId
    if (assetType) where.asset = { is: { assetType } }
    if (reportedById) where.reportedById = reportedById
    if (status) where.status = status
    if (priority) where.priority = priority
    if (faultType) where.faultType = faultType
    if (dateFrom || dateTo) {
      where.reportedAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
      }
    }

    const faults = await db.fault.findMany({
      where,
      include: {
        asset: { select: { nameFa: true, assetCode: true, assetType: true } },
        reportedBy: { select: { id: true, name: true } },
      },
      orderBy: { reportedAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(faults)
  } catch (error) {
    console.error('Faults error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fault = await db.fault.create({ data: body })
    
    // Create timeline event
    await db.timelineEvent.create({
      data: {
        assetId: body.assetId,
        eventType: 'fault',
        title: 'ثبت خرابی جدید',
        description: body.description,
        performedBy: body.reportedById,
        relatedId: fault.id,
        relatedType: 'fault',
      }
    })

    // Update asset status
    await db.asset.update({ where: { id: body.assetId }, data: { status: 'faulty' } })

    return NextResponse.json(fault, { status: 201 })
  } catch (error) {
    console.error('Create fault error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
