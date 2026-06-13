import { db } from '@/lib/db'
import { calculatePmStatus, getTriggerType, recalculateNextDueAt, recalculateNextDueRunningHours } from '@/lib/pm'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const plan = await db.preventiveMaintenancePlan.findUnique({
      where: { id },
      include: {
        asset: { select: { nameFa: true, assetCode: true, id: true, assetType: true } },
        workOrders: {
          include: {
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!plan) return NextResponse.json({ error: 'برنامه PM یافت نشد' }, { status: 404 })

    // Get latest manual usage. Vehicles use odometer logs; other assets use inspection running hours.
    const currentRunningHours = plan.asset.assetType === 'vehicle'
      ? (await db.vehicleOdometerLog.findFirst({
        where: { assetId: plan.assetId },
        orderBy: { readingAt: 'desc' },
        select: { readingKm: true },
      }))?.readingKm ?? null
      : (await db.inspection.findFirst({
        where: { assetId: plan.assetId, runningHours: { not: null } },
        orderBy: { date: 'desc' },
        select: { runningHours: true },
      }))?.runningHours ?? null
    const pmStatus = calculatePmStatus(plan, currentRunningHours, new Date())
    const triggerType = getTriggerType(plan)

    return NextResponse.json({
      ...plan,
      currentRunningHours,
      pmStatus,
      triggerType,
    })
  } catch (error) {
    console.error('PM plan detail error:', error)
    return NextResponse.json({ error: 'خطا در دریافت جزئیات برنامه PM' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.preventiveMaintenancePlan.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'برنامه PM یافت نشد' }, { status: 404 })

    // Recalculate nextDueAt if intervalDays changed or lastServiceAt changed
    let nextDueAt = body.nextDueAt ? new Date(body.nextDueAt) : undefined
    if (body.intervalDays !== undefined || body.lastServiceAt !== undefined) {
      const intervalDays = body.intervalDays ?? existing.intervalDays
      const lastServiceAt = body.lastServiceAt ? new Date(body.lastServiceAt) : existing.lastServiceAt
      if (intervalDays) {
        const baseline = lastServiceAt || new Date()
        nextDueAt = new Date(baseline.getTime() + intervalDays * 86400000)
      }
    }

    // Recalculate nextDueRunningHours if intervalRunningHours changed or lastServiceHours changed
    let nextDueRunningHours = body.nextDueRunningHours ?? undefined
    if (body.intervalRunningHours !== undefined || body.lastServiceHours !== undefined) {
      const intervalRH = body.intervalRunningHours ?? existing.intervalRunningHours
      const lastSH = body.lastServiceHours ?? existing.lastServiceHours
      if (intervalRH && lastSH != null) {
        nextDueRunningHours = lastSH + intervalRH
      }
    }

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.intervalDays !== undefined) updateData.intervalDays = body.intervalDays || null
    if (body.lastServiceAt !== undefined) updateData.lastServiceAt = body.lastServiceAt ? new Date(body.lastServiceAt) : null
    if (nextDueAt !== undefined) updateData.nextDueAt = nextDueAt
    if (body.intervalRunningHours !== undefined) updateData.intervalRunningHours = body.intervalRunningHours || null
    if (body.lastServiceHours !== undefined) updateData.lastServiceHours = body.lastServiceHours ?? null
    if (nextDueRunningHours !== undefined) updateData.nextDueRunningHours = nextDueRunningHours
    if (body.leadTimeDays !== undefined) updateData.leadTimeDays = body.leadTimeDays
    if (body.autoCreateWorkOrder !== undefined) updateData.autoCreateWorkOrder = body.autoCreateWorkOrder
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.checklistTemplate !== undefined) updateData.checklistTemplate = body.checklistTemplate || null
    if (body.notes !== undefined) updateData.notes = body.notes || null

    const plan = await db.preventiveMaintenancePlan.update({
      where: { id },
      data: updateData,
      include: {
        asset: { select: { nameFa: true, assetCode: true } },
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Update PM plan error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی برنامه PM' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.preventiveMaintenancePlan.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'برنامه PM یافت نشد' }, { status: 404 })

    // Soft delete: set isActive = false
    const plan = await db.preventiveMaintenancePlan.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Delete PM plan error:', error)
    return NextResponse.json({ error: 'خطا در حذف برنامه PM' }, { status: 500 })
  }
}
