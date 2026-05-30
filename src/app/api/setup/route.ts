import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Try a simple query to check if the database is reachable and tables exist
    await db.user.count()
    return NextResponse.json({ success: true, message: 'دیتابیس آماده است' })
  } catch (error: any) {
    // If tables don't exist, try to push schema using Prisma
    console.error('DB check failed, attempting setup:', error.message)

    // If the error is about missing tables, we need to push the schema
    // On Vercel, we use prisma db push via the Vercel CLI or manually
    // For now, return instructions
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return NextResponse.json({
        success: false,
        error: 'جداول دیتابیس ایجاد نشده‌اند. لطفاً دستور prisma db push را اجرا کنید.',
        needsSetup: true,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: `خطای اتصال به دیتابیس: ${error.message}`,
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    await db.user.count()
    return NextResponse.json({ success: true, message: 'دیتابیس آماده است' })
  } catch (error: any) {
    console.error('DB check failed:', error.message)

    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return NextResponse.json({
        success: false,
        error: 'جداول دیتابیس ایجاد نشده‌اند.',
        needsSetup: true,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: `خطای اتصال به دیتابیس: ${error.message}`,
    }, { status: 500 })
  }
}
