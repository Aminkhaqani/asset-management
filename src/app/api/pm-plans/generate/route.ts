import { db } from '@/lib/db'
import { calculatePmStatus } from '@/lib/pm'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dryRun } = body

    // Find all active PM plans
    const plans = await db.preventiveMaintenancePlan.findMany({
      where: { isActive: true },
      include: {
        asset: { select: { nameFa: true, assetCode: true, id: true } },
      },
    })

    const today = new Date()
    const results: Array<{
      planId: string
      planTitle: string
      assetName: string
      action: 'created' | 'skipped_duplicate' | 'skipped_not_due' | 'skipped_no_auto'
      pmStatus: ReturnType<typeof calculatePmStatus>
      workOrderId?: string
    }> = []

    for (const plan of plans) {
      // Get latest running hours for this asset
      const latestInspection = await db.inspection.findFirst({
        where: { assetId: plan.assetId, runningHours: { not: null } },
        orderBy: { date: 'desc' },
        select: { runningHours: true },
      })
      const currentRunningHours = latestInspection?.runningHours ?? null

      const pmStatus = calculatePmStatus(plan, currentRunningHours, today)

      // Only process if due or upcoming, and auto-create is enabled
      if (!pmStatus.isDue && !pmStatus.isUpcoming) {
        results.push({
          planId: plan.id,
          planTitle: plan.title,
          assetName: plan.asset.nameFa,
          action: 'skipped_not_due',
          pmStatus,
        })
        continue
      }

      if (!plan.autoCreateWorkOrder) {
        results.push({
          planId: plan.id,
          planTitle: plan.title,
          assetName: plan.asset.nameFa,
          action: 'skipped_no_auto',
          pmStatus,
        })
        continue
      }

      // Check for duplicate open WorkOrder for this plan
      const existingWO = await db.workOrder.findFirst({
        where: {
          pmPlanId: plan.id,
          status: { in: ['pending', 'assigned', 'in_progress'] },
        },
      })

      if (existingWO) {
        results.push({
          planId: plan.id,
          planTitle: plan.title,
          assetName: plan.asset.nameFa,
          action: 'skipped_duplicate',
          pmStatus,
        })
        continue
      }

      // Dry run - don't actually create
      if (dryRun) {
        results.push({
          planId: plan.id,
          planTitle: plan.title,
          assetName: plan.asset.nameFa,
          action: 'created',
          pmStatus,
        })
        continue
      }

      // Create WorkOrder
      const dueReasonLabel = pmStatus.dueReason === 'time'
        ? 'بر اساس زمان'
        : pmStatus.dueReason === 'running_hours'
          ? 'بر اساس ساعت کارکرد'
          : 'بر اساس زمان و ساعت کارکرد'

      const wo = await db.workOrder.create({
        data: {
          type: 'preventive',
          assetId: plan.assetId,
          pmPlanId: plan.id,
          title: `PM: ${plan.title}`,
          description: `دستور کار خودکار PM - ${dueReasonLabel}${plan.description ? '\n' + plan.description : ''}`,
          priority: plan.priority,
          status: 'pending',
          scheduledDate: today,
          notes: plan.checklistTemplate || plan.notes || null,
        },
      })

      // Update plan's lastGeneratedAt
      await db.preventiveMaintenancePlan.update({
        where: { id: plan.id },
        data: {
          lastGeneratedAt: today,
          lastGeneratedWorkOrderId: wo.id,
        },
      })

      // Create timeline event
      await db.timelineEvent.create({
        data: {
          assetId: plan.assetId,
          eventType: 'maintenance',
          title: 'تولید دستور کار PM',
          description: `دستور کار PM "${plan.title}" به صورت خودکار تولید شد - ${dueReasonLabel}`,
          relatedId: wo.id,
          relatedType: 'workorder',
        },
      })

      results.push({
        planId: plan.id,
        planTitle: plan.title,
        assetName: plan.asset.nameFa,
        action: 'created',
        pmStatus,
        workOrderId: wo.id,
      })
    }

    const createdCount = results.filter(r => r.action === 'created').length
    const skippedCount = results.filter(r => r.action !== 'created').length

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        created: createdCount,
        skipped: skippedCount,
      },
      results,
    })
  } catch (error) {
    console.error('Generate PM work orders error:', error)
    return NextResponse.json({ error: 'خطا در تولید دستور کارهای PM' }, { status: 500 })
  }
}
