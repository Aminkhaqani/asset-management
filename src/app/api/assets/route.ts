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
    const asset = await db.asset.create({ data: body })
    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
