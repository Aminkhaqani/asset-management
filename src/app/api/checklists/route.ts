import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId') || ''

    const where: Record<string, unknown> = { isActive: true }
    if (assetId) where.assetId = assetId

    const checklists = await db.checklist.findMany({
      where,
      include: { asset: { select: { nameFa: true, assetCode: true } } },
      orderBy: { nextDueAt: 'asc' },
    })
    return NextResponse.json(checklists)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const checklist = await db.checklist.create({ data: body })
    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
