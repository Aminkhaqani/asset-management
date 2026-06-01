import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim()

    if (!code) {
      return NextResponse.json({ error: 'کد تجهیز الزامی است' }, { status: 400 })
    }

    const asset = await db.asset.findFirst({
      where: {
        OR: [
          { assetCode: code },
          { qrCode: code },
        ],
      },
      include: {
        category: true,
        location: true,
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'تجهیزی با این کد پیدا نشد' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Asset lookup error:', error)
    return NextResponse.json({ error: 'خطا در جستجوی تجهیز' }, { status: 500 })
  }
}
