import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST() {
  try {
    // Step 1: Push schema to database
    console.log('Pushing Prisma schema to database...')
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'pipe',
      env: { ...process.env },
    })
    console.log('Schema pushed successfully')

    return NextResponse.json({
      success: true,
      message: 'اسکیمای دیتابیس با موفقیت ایجاد شد. حالا /api/seed را برای بارگذاری داده‌های نمونه صدا بزنید.',
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'برای راه‌اندازی دیتابیس، یک درخواست POST به این آدرس بفرستید.',
  })
}
