import { db } from '@/lib/db'
import { recalculateNextDueAt, recalculateNextDueRunningHours } from '@/lib/pm'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const wo = await db.workOrder.findUnique({
      where: { id },
      include: {
        asset: { include: { category: true, location: true } },
        assignedTo: true,
        approvedBy: true,
        fault: true,
        workshop: true,
        pmPlan: true,
      },
    })
    if (!wo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(wo)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const wo = await db.workOrder.update({ where: { id }, data: body })

    // If work order completed and asset has no other open work orders, set to active
    if (body.status === 'completed' || body.status === 'approved') {
      const otherWOs = await db.workOrder.count({
        where: { assetId: wo.assetId, status: { in: ['pending', 'assigned', 'in_progress'] }, id: { not: id } }
      })
      const otherFaults = await db.fault.count({
        where: { assetId: wo.assetId, status: { in: ['open', 'in_progress'] } }
      })
      if (otherWOs === 0 && otherFaults === 0) {
        await db.asset.update({ where: { id: wo.assetId }, data: { status: 'active' } })
      }

      // If this work order is linked to a PM plan, update the plan's service tracking
      if (wo.pmPlanId && body.status === 'completed') {
        const plan = await db.preventiveMaintenancePlan.findUnique({ where: { id: wo.pmPlanId } })
        if (plan) {
          const completedAt = new Date()
          const asset = await db.asset.findUnique({
            where: { id: wo.assetId },
            select: { assetType: true },
          })

          // Vehicles use odometer logs; other assets use inspection running hours.
          const currentRunningHours = asset?.assetType === 'vehicle'
            ? (await db.vehicleOdometerLog.findFirst({
              where: { assetId: wo.assetId },
              orderBy: { readingAt: 'desc' },
              select: { readingKm: true },
            }))?.readingKm ?? null
            : (await db.inspection.findFirst({
              where: { assetId: wo.assetId, runningHours: { not: null } },
              orderBy: { date: 'desc' },
              select: { runningHours: true },
            }))?.runningHours ?? null

          // Recalculate next due values
          const nextDueAt = recalculateNextDueAt(plan, completedAt)
          const nextDueRunningHours = recalculateNextDueRunningHours(plan, currentRunningHours)

          await db.preventiveMaintenancePlan.update({
            where: { id: plan.id },
            data: {
              lastServiceAt: completedAt,
              lastServiceHours: currentRunningHours,
              nextDueAt,
              nextDueRunningHours,
            },
          })

          // Create timeline event for PM plan update
          await db.timelineEvent.create({
            data: {
              assetId: wo.assetId,
              eventType: 'maintenance',
              title: 'بروزرسانی برنامه PM',
              description: `پس از تکمیل دستور کار "${wo.title}"، برنامه PM "${plan.title}" بروزرسانی شد`,
              relatedId: plan.id,
              relatedType: 'pm_plan',
            },
          })
        }
      }
    }

    return NextResponse.json(wo)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
