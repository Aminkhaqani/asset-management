import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    if (body.markAllRead && body.userId) {
      await db.notification.updateMany({ where: { userId: body.userId, isRead: false }, data: { isRead: true } })
      return NextResponse.json({ success: true })
    }
    if (body.id) {
      const n = await db.notification.update({ where: { id: body.id }, data: { isRead: true } })
      return NextResponse.json(n)
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
