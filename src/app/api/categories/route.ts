import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { assetCategoryDefinitions } from '@/lib/asset-categories'

async function syncStandardCategories() {
  const existingCategories = await db.assetCategory.findMany({
    select: { id: true, assetType: true, standardKey: true, nameFa: true, nameEn: true, icon: true, color: true, sortOrder: true },
  })

  for (const definition of assetCategoryDefinitions) {
    const existing = existingCategories.find((category) => category.standardKey === definition.key)
      || existingCategories.find((category) =>
        !category.standardKey
        && category.assetType === definition.assetType
        && (category.nameEn.toLowerCase() === definition.nameEn.toLowerCase() || category.nameFa === definition.nameFa)
      )

    if (existing) {
      const shouldUpdate = existing.nameFa !== definition.nameFa
        || existing.nameEn !== definition.nameEn
        || existing.assetType !== definition.assetType
        || existing.standardKey !== definition.key
        || existing.icon !== definition.icon
        || existing.color !== definition.color
        || existing.sortOrder !== definition.sortOrder

      if (shouldUpdate) {
        await db.assetCategory.update({
          where: { id: existing.id },
          data: {
            nameFa: definition.nameFa,
            nameEn: definition.nameEn,
            assetType: definition.assetType,
            standardKey: definition.key,
            icon: definition.icon,
            color: definition.color,
            sortOrder: definition.sortOrder,
          },
        })
      }
    } else {
      await db.assetCategory.create({
        data: {
          nameFa: definition.nameFa,
          nameEn: definition.nameEn,
          assetType: definition.assetType,
          standardKey: definition.key,
          icon: definition.icon,
          color: definition.color,
          sortOrder: definition.sortOrder,
        },
      })
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get('assetType') || ''

    await syncStandardCategories()

    const categories = await db.assetCategory.findMany({
      where: assetType ? { assetType } : undefined,
      include: { _count: { select: { assets: true } } },
      orderBy: [{ assetType: 'asc' }, { sortOrder: 'asc' }, { nameFa: 'asc' }],
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
