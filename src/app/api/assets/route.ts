import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const status = searchParams.get('status') || ''
    const locationId = searchParams.get('locationId') || ''
    const criticality = searchParams.get('criticality') || ''
    const assetType = searchParams.get('assetType') || ''
    const lifecycleStage = searchParams.get('lifecycleStage') || ''

    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { nameFa: { contains: search } },
        { assetCode: { contains: search } },
        { nameEn: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (status) where.status = status
    if (locationId) where.locationId = locationId
    if (criticality) where.criticality = criticality
    if (assetType) where.assetType = assetType
    if (lifecycleStage) where.lifecycleStage = lifecycleStage

    const assets = await db.asset.findMany({
      where,
      include: { category: true, location: true, _count: { select: { faults: true, workOrders: true } } },
      orderBy: { assetCode: 'asc' },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Assets list error:', error)
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const asset = await db.asset.create({
      data: {
        assetCode: body.assetCode,
        nameFa: body.nameFa,
        nameEn: body.nameEn || null,
        assetType: body.assetType || 'equipment',
        lifecycleStage: body.lifecycleStage || 'operation',
        assetPortfolio: body.assetPortfolio || null,
        requiredFunction: body.requiredFunction || null,
        valueContribution: body.valueContribution || null,
        performanceTarget: body.performanceTarget || null,
        riskImpact: body.riskImpact || 'medium',
        riskLikelihood: body.riskLikelihood || 'medium',
        regulatoryRequirements: body.regulatoryRequirements || null,
        categoryId: body.categoryId,
        locationId: body.locationId,
        brand: body.brand || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        capacity: body.capacity || null,
        specifications: body.specifications || null,
        customFields: body.customFields || {},
        criticality: body.criticality || 'medium',
        status: body.status || 'active',
        qrCode: body.qrCode,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
