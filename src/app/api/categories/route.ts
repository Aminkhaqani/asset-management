import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await db.assetCategory.findMany({ include: { _count: { select: { assets: true } } }, orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
