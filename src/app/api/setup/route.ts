import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST() {
  try {
    console.log('Running prisma db push...')
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    })
    console.log('Database schema pushed successfully')
    return NextResponse.json({ success: true, message: 'اسکیما دیتابیس با موفقیت اعمال شد' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('Running prisma db push...')
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    })
    console.log('Database schema pushed successfully')
    return NextResponse.json({ success: true, message: 'اسکیما دیتابیس با موفقیت اعمال شد' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
