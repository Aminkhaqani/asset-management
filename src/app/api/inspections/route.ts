import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId') || ''
    const assetType = searchParams.get('assetType') || ''
    const inspectorId = searchParams.get('inspectorId') || ''
    const status = searchParams.get('status') || ''
    const shift = searchParams.get('shift') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    
    const where: Record<string, unknown> = {}
    if (assetId) where.assetId = assetId
    if (assetType) where.asset = { is: { assetType } }
    if (inspectorId) where.inspectorId = inspectorId
    if (status) where.status = status
    if (shift) where.shift = shift
    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
      }
    }

    const inspections = await db.inspection.findMany({
      where,
      include: {
        asset: { select: { nameFa: true, assetCode: true, assetType: true } },
        inspector: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    })
    return NextResponse.json(inspections)
  } catch (error) {
    console.error('Inspections error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate assetId is provided
    if (!body.assetId) {
      return NextResponse.json({ error: 'شناسه تجهیز الزامی است' }, { status: 400 })
    }

    // Verify the asset exists
    const asset = await db.asset.findUnique({ where: { id: body.assetId } })
    if (!asset) {
      return NextResponse.json({ error: 'تجهیز مورد نظر یافت نشد' }, { status: 404 })
    }

    const inspection = await db.inspection.create({ data: body })
    
    // Create timeline event
    await db.timelineEvent.create({
      data: {
        assetId: body.assetId,
        eventType: 'inspection',
        title: 'بازدید جدید',
        description: `بازدید ${body.shift === 'morning' ? 'صبحی' : body.shift === 'afternoon' ? 'عصر' : 'شب'} - وضعیت: ${body.status === 'normal' ? 'عادی' : body.status === 'warning' ? 'هشدار' : 'بحرانی'}`,
        performedBy: body.inspectorId,
        relatedId: inspection.id,
        relatedType: 'inspection',
      }
    })

    // Update asset status if critical
    if (body.status === 'critical') {
      await db.asset.update({ where: { id: body.assetId }, data: { status: 'faulty' } })
    }

    return NextResponse.json(inspection, { status: 201 })
  } catch (error) {
    console.error('Create inspection error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
