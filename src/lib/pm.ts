export type PmDueStatus = {
  isDue: boolean
  isUpcoming: boolean
  dueReason: 'time' | 'running_hours' | 'both' | null
  daysRemaining?: number | null
  hoursRemaining?: number | null
  overdueDays?: number | null
  overdueHours?: number | null
}

interface PMPlan {
  intervalDays: number | null
  lastServiceAt: Date | null
  nextDueAt: Date | null
  intervalRunningHours: number | null
  lastServiceHours: number | null
  nextDueRunningHours: number | null
  leadTimeDays: number
}

/**
 * Check if time-based PM is due
 */
export function calculateTimeDue(plan: PMPlan, today: Date): PmDueStatus {
  if (!plan.intervalDays) {
    return {
      isDue: false,
      isUpcoming: false,
      dueReason: null,
      daysRemaining: null,
      hoursRemaining: null,
      overdueDays: null,
      overdueHours: null,
    }
  }

  // Calculate nextDueAt if not set
  const nextDue = plan.nextDueAt
    ? new Date(plan.nextDueAt)
    : plan.lastServiceAt
      ? new Date(new Date(plan.lastServiceAt).getTime() + plan.intervalDays * 86400000)
      : null

  if (!nextDue) {
    // No history - can't determine due status without a baseline
    return {
      isDue: false,
      isUpcoming: false,
      dueReason: null,
      daysRemaining: null,
      hoursRemaining: null,
      overdueDays: null,
      overdueHours: null,
    }
  }

  const diffMs = nextDue.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / 86400000)

  if (diffDays <= 0) {
    return {
      isDue: true,
      isUpcoming: false,
      dueReason: 'time',
      daysRemaining: 0,
      overdueDays: Math.abs(diffDays),
      hoursRemaining: null,
      overdueHours: null,
    }
  }

  if (diffDays <= plan.leadTimeDays) {
    return {
      isDue: false,
      isUpcoming: true,
      dueReason: 'time',
      daysRemaining: diffDays,
      overdueDays: null,
      hoursRemaining: null,
      overdueHours: null,
    }
  }

  return {
    isDue: false,
    isUpcoming: false,
    dueReason: null,
    daysRemaining: diffDays,
    overdueDays: null,
    hoursRemaining: null,
    overdueHours: null,
  }
}

/**
 * Check if running-hours-based PM is due
 */
export function calculateRunningHoursDue(plan: PMPlan, currentRunningHours: number | null): PmDueStatus {
  if (!plan.intervalRunningHours) {
    return {
      isDue: false,
      isUpcoming: false,
      dueReason: null,
      daysRemaining: null,
      hoursRemaining: null,
      overdueDays: null,
      overdueHours: null,
    }
  }

  if (currentRunningHours === null || currentRunningHours === undefined) {
    return {
      isDue: false,
      isUpcoming: false,
      dueReason: null,
      daysRemaining: null,
      hoursRemaining: null,
      overdueDays: null,
      overdueHours: null,
    }
  }

  // Calculate nextDueRunningHours if not set
  const nextDueHours = plan.nextDueRunningHours
    ?? (plan.lastServiceHours !== null && plan.lastServiceHours !== undefined
      ? plan.lastServiceHours + plan.intervalRunningHours
      : null)

  if (nextDueHours === null) {
    return {
      isDue: false,
      isUpcoming: false,
      dueReason: null,
      daysRemaining: null,
      hoursRemaining: null,
      overdueDays: null,
      overdueHours: null,
    }
  }

  const diffHours = nextDueHours - currentRunningHours

  if (diffHours <= 0) {
    return {
      isDue: true,
      isUpcoming: false,
      dueReason: 'running_hours',
      daysRemaining: null,
      hoursRemaining: 0,
      overdueDays: null,
      overdueHours: Math.abs(diffHours),
    }
  }

  // Lead time for running hours: consider upcoming if within 20% of interval
  const upcomingThreshold = plan.intervalRunningHours * 0.2
  if (diffHours <= upcomingThreshold) {
    return {
      isDue: false,
      isUpcoming: true,
      dueReason: 'running_hours',
      daysRemaining: null,
      hoursRemaining: Math.round(diffHours * 10) / 10,
      overdueDays: null,
      overdueHours: null,
    }
  }

  return {
    isDue: false,
    isUpcoming: false,
    dueReason: null,
    daysRemaining: null,
    hoursRemaining: Math.round(diffHours * 10) / 10,
    overdueDays: null,
    overdueHours: null,
  }
}

/**
 * Combined status check for both time-based and running-hours-based PM
 */
export function calculatePmStatus(plan: PMPlan, currentRunningHours: number | null, today: Date): PmDueStatus {
  const timeStatus = calculateTimeDue(plan, today)
  const hoursStatus = calculateRunningHoursDue(plan, currentRunningHours)

  const hasTimeTrigger = plan.intervalDays !== null && plan.intervalDays !== undefined
  const hasHoursTrigger = plan.intervalRunningHours !== null && plan.intervalRunningHours !== undefined

  // If only time-based
  if (hasTimeTrigger && !hasHoursTrigger) {
    return timeStatus
  }

  // If only running-hours-based
  if (!hasTimeTrigger && hasHoursTrigger) {
    // Special case: has hours trigger but no running hours data
    if (currentRunningHours === null || currentRunningHours === undefined) {
      return {
        isDue: false,
        isUpcoming: false,
        dueReason: null,
        daysRemaining: timeStatus.daysRemaining,
        hoursRemaining: null,
        overdueDays: null,
        overdueHours: null,
      }
    }
    return hoursStatus
  }

  // Both triggers - combine statuses
  const isDue = timeStatus.isDue || hoursStatus.isDue
  const isUpcoming = !isDue && (timeStatus.isUpcoming || hoursStatus.isUpcoming)

  let dueReason: PmDueStatus['dueReason'] = null
  if (isDue) {
    if (timeStatus.isDue && hoursStatus.isDue) dueReason = 'both'
    else if (timeStatus.isDue) dueReason = 'time'
    else dueReason = 'running_hours'
  } else if (isUpcoming) {
    if (timeStatus.isUpcoming && hoursStatus.isUpcoming) dueReason = 'both'
    else if (timeStatus.isUpcoming) dueReason = 'time'
    else dueReason = 'running_hours'
  }

  return {
    isDue,
    isUpcoming,
    dueReason,
    daysRemaining: timeStatus.daysRemaining,
    hoursRemaining: hoursStatus.hoursRemaining,
    overdueDays: timeStatus.overdueDays,
    overdueHours: hoursStatus.overdueHours,
  }
}

/**
 * Get the trigger type description for a plan
 */
export function getTriggerType(plan: PMPlan): 'time' | 'running_hours' | 'both' {
  const hasTime = plan.intervalDays !== null && plan.intervalDays !== undefined
  const hasHours = plan.intervalRunningHours !== null && plan.intervalRunningHours !== undefined

  if (hasTime && hasHours) return 'both'
  if (hasTime) return 'time'
  return 'running_hours'
}

/**
 * Recalculate nextDueAt after service completion
 */
export function recalculateNextDueAt(plan: PMPlan, completedAt: Date): Date | null {
  if (!plan.intervalDays) return null
  return new Date(completedAt.getTime() + plan.intervalDays * 86400000)
}

/**
 * Recalculate nextDueRunningHours after service completion
 */
export function recalculateNextDueRunningHours(plan: PMPlan, currentRunningHours: number | null): number | null {
  if (!plan.intervalRunningHours) return null
  if (currentRunningHours === null || currentRunningHours === undefined) return null
  return Math.round((currentRunningHours + plan.intervalRunningHours) * 10) / 10
}
