import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const inspection = await db.inspection.findUnique({
      where: { id },
      include: {
        asset: { select: { nameFa: true, assetCode: true, id: true } },
        inspector: { select: { name: true, role: true } },
      },
    })
    if (!inspection) {
      return NextResponse.json({ error: 'بازدید یافت نشد' }, { status: 404 })
    }
    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Inspection detail error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
