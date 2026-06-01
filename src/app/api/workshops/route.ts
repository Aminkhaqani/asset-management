import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive') || ''
    const specialty = searchParams.get('specialty') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { contactPerson: { contains: search } },
      ]
    }
    if (isActive !== '') where.isActive = isActive === 'true'
    if (specialty) where.specialty = specialty

    const workshops = await db.workshop.findMany({
      where,
      include: {
        _count: { select: { workOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(workshops)
  } catch (error) {
    console.error('Workshops list error:', error)
    return NextResponse.json({ error: 'Failed to load workshops' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const workshop = await db.workshop.create({ data: body })
    return NextResponse.json(workshop, { status: 201 })
  } catch (error) {
    console.error('Create workshop error:', error)
    return NextResponse.json({ error: 'Failed to create workshop' }, { status: 500 })
  }
}
