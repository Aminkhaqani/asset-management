import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const locations = await db.location.findMany({ include: { _count: { select: { assets: true } }, parent: { select: { name: true } } }, orderBy: { name: 'asc' } })
    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
