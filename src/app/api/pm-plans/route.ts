import { db } from '@/lib/db'
import { calculatePmStatus, getTriggerType } from '@/lib/pm'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId') || ''
    const active = searchParams.get('active')
    const due = searchParams.get('due') === 'true'
    const upcoming = searchParams.get('upcoming') === 'true'

    const where: Record<string, unknown> = {}
    if (assetId) where.assetId = assetId
    if (active !== null && active !== '') {
      where.isActive = active === 'true'
    } else {
      where.isActive = true
    }

    const plans = await db.preventiveMaintenancePlan.findMany({
      where,
      include: {
        asset: { select: { nameFa: true, assetCode: true, id: true } },
        workOrders: {
          where: { status: { in: ['pending', 'assigned', 'in_progress'] } },
          select: { id: true, status: true, title: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get latest running hours for each asset
    const assetIds = [...new Set(plans.map(p => p.assetId))]
    const latestInspections: Record<string, number | null> = {}
    
    for (const aid of assetIds) {
      const insp = await db.inspection.findFirst({
        where: { assetId: aid, runningHours: { not: null } },
        orderBy: { date: 'desc' },
        select: { runningHours: true },
      })
      latestInspections[aid] = insp?.runningHours ?? null
    }

    const today = new Date()

    // Enrich plans with PM status
    const enrichedPlans = plans.map(plan => {
      const currentRunningHours = latestInspections[plan.assetId] ?? null
      const pmStatus = calculatePmStatus(plan, currentRunningHours, today)
      const triggerType = getTriggerType(plan)

      return {
        ...plan,
        currentRunningHours,
        pmStatus,
        triggerType,
        hasOpenWorkOrder: plan.workOrders.length > 0,
      }
    })

    // Filter by due/upcoming if requested
    let filtered = enrichedPlans
    if (due && upcoming) {
      filtered = enrichedPlans.filter(p => p.pmStatus.isDue || p.pmStatus.isUpcoming)
    } else if (due) {
      filtered = enrichedPlans.filter(p => p.pmStatus.isDue)
    } else if (upcoming) {
      filtered = enrichedPlans.filter(p => p.pmStatus.isUpcoming)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('PM plans error:', error)
    return NextResponse.json({ error: 'خطا در دریافت برنامه‌های PM' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.assetId) {
      return NextResponse.json({ error: 'شناسه تجهیز الزامی است' }, { status: 400 })
    }
    if (!body.title) {
      return NextResponse.json({ error: 'عنوان برنامه الزامی است' }, { status: 400 })
    }

    // Verify asset exists
    const asset = await db.asset.findUnique({ where: { id: body.assetId } })
    if (!asset) {
      return NextResponse.json({ error: 'تجهیز مورد نظر یافت نشد' }, { status: 404 })
    }

    // Validate at least one trigger is set
    if (!body.intervalDays && !body.intervalRunningHours) {
      return NextResponse.json({ error: 'حداقل یکی از بازه زمانی یا ساعت کارکرد باید مشخص شود' }, { status: 400 })
    }

    // Calculate nextDueAt if intervalDays is set
    let nextDueAt = body.nextDueAt ? new Date(body.nextDueAt) : null
    if (!nextDueAt && body.intervalDays) {
      const baseline = body.lastServiceAt ? new Date(body.lastServiceAt) : new Date()
      nextDueAt = new Date(baseline.getTime() + body.intervalDays * 86400000)
    }

    // Calculate nextDueRunningHours if intervalRunningHours is set
    let nextDueRunningHours = body.nextDueRunningHours ?? null
    if (nextDueRunningHours === null && body.intervalRunningHours && body.lastServiceHours != null) {
      nextDueRunningHours = body.lastServiceHours + body.intervalRunningHours
    }

    const plan = await db.preventiveMaintenancePlan.create({
      data: {
        assetId: body.assetId,
        title: body.title,
        description: body.description || null,
        isActive: body.isActive ?? true,
        intervalDays: body.intervalDays || null,
        lastServiceAt: body.lastServiceAt ? new Date(body.lastServiceAt) : null,
        nextDueAt,
        intervalRunningHours: body.intervalRunningHours || null,
        lastServiceHours: body.lastServiceHours ?? null,
        nextDueRunningHours,
        leadTimeDays: body.leadTimeDays ?? 3,
        autoCreateWorkOrder: body.autoCreateWorkOrder ?? true,
        priority: body.priority || 'medium',
        checklistTemplate: body.checklistTemplate || null,
        notes: body.notes || null,
      },
      include: {
        asset: { select: { nameFa: true, assetCode: true } },
      },
    })

    // Create timeline event
    await db.timelineEvent.create({
      data: {
        assetId: body.assetId,
        eventType: 'maintenance',
        title: 'ایجاد برنامه PM',
        description: `برنامه نگهداری پیشگیرانه "${body.title}" برای تجهیز ${asset.nameFa} ایجاد شد`,
        relatedId: plan.id,
        relatedType: 'pm_plan',
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Create PM plan error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد برنامه PM' }, { status: 500 })
  }
}
