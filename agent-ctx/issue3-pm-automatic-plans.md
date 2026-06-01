# Issue #3 - Automatic PM based on running hours and time elapsed

## Summary
Implemented automatic PM (Preventive Maintenance) plan system with support for time-based and running-hours-based triggers.

## Files Created

### 1. `src/lib/pm.ts`
PM logic library with functions:
- `calculateTimeDue(plan, today)` - checks if time-based PM is due
- `calculateRunningHoursDue(plan, currentRunningHours)` - checks if running-hours PM is due
- `calculatePmStatus(plan, currentRunningHours, today)` - combined status check
- `getTriggerType(plan)` - determines trigger type
- `recalculateNextDueAt(plan, completedAt)` - recalculates next due date after service
- `recalculateNextDueRunningHours(plan, currentRunningHours)` - recalculates next due hours after service
- `PmDueStatus` type with isDue, isUpcoming, dueReason, daysRemaining, hoursRemaining, overdueDays, overdueHours

### 2. `src/app/api/pm-plans/route.ts`
- GET: List PM plans with filters (assetId, active, due, upcoming), enriched with PM status
- POST: Create new PM plan with validation and auto-calculation of nextDueAt/nextDueRunningHours

### 3. `src/app/api/pm-plans/[id]/route.ts`
- GET: Single PM plan with full details and computed PM status
- PUT: Update PM plan with auto-recalculation of due dates
- DELETE: Soft delete (isActive=false)

### 4. `src/app/api/pm-plans/generate/route.ts`
- POST: Auto-generate WorkOrders for due/upcoming plans
  - Finds all active plans
  - Gets latest running hours from inspections
  - Checks due/upcoming status
  - Prevents duplicate open WorkOrders
  - Creates WorkOrder with type='preventive', pmPlanId set
  - Creates TimelineEvent
  - Supports dry-run mode

### 5. `src/components/maintenance/PMPlansList.tsx`
Full-featured PM plans list component with:
- Plan cards with status badges (موعد رسیده/نزدیک موعد/عادی)
- Due reason labels (بر اساس زمان/بر اساس ساعت کارکرد/both)
- Add/Edit PM plan form (Sheet component)
- Delete confirmation dialog
- "تولید دستور کارهای PM" generate button
- Running hours and time remaining/overdue display

## Files Modified

### 6. `prisma/schema.prisma`
- Added `PreventiveMaintenancePlan` model with time and running-hours triggers
- Added `pmPlans` relation to Asset model
- Added `pmPlanId` and `pmPlan` relation to WorkOrder model
- Changed datasource from postgresql to sqlite (matching actual database)

### 7. `src/app/api/work-orders/[id]/route.ts`
- Added pmPlan include in GET
- Added PM plan update logic when WorkOrder status changes to 'completed':
  - Updates lastServiceAt, lastServiceHours
  - Recalculates nextDueAt and nextDueRunningHours
  - Creates timeline event for PM plan update

### 8. `src/app/api/assets/[id]/route.ts`
- Added pmPlans include in GET (where isActive: true)

### 9. `src/components/assets/AssetDetail.tsx`
- Added "PM دوره‌ای" tab with Settings icon
- Uses PMPlansList component with assetId filter

### 10. `src/components/maintenance/MaintenancePage.tsx`
- Added "PMهای موعددار" tab showing due/upcoming plans
- Added "برنامه‌های PM" tab with full PMPlansList
- Added CalendarClock and Settings icons
- Added due/upcoming plans query

## Persian Labels
- Status badges: موعد رسیده (red), نزدیک موعد (amber), عادی (green)
- Due reasons: بر اساس زمان, بر اساس ساعت کارکرد, بر اساس زمان و ساعت کارکرد
- Special case: ساعت کارکرد ثبت نشده (when no runningHours data available)
