import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function parseOptionalDate(value: unknown) {
  return value ? new Date(String(value)) : new Date()
}

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCustomFields(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

async function getVehicleAsset(id: string) {
  const asset = await db.asset.findUnique({
    where: { id },
    select: { id: true, nameFa: true, assetCode: true, assetType: true, customFields: true },
  })

  if (!asset) return { asset: null, response: NextResponse.json({ error: 'Asset not found' }, { status: 404 }) }
  if (asset.assetType !== 'vehicle') {
    return { asset: null, response: NextResponse.json({ error: 'Vehicle records are only available for vehicle assets' }, { status: 400 }) }
  }

  return { asset, response: null }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { response } = await getVehicleAsset(id)
    if (response) return response

    const [odometerLogs, fuelLogs, driverAssignments, incidents] = await Promise.all([
      db.vehicleOdometerLog.findMany({ where: { assetId: id }, orderBy: { readingAt: 'desc' }, take: 20 }),
      db.vehicleFuelLog.findMany({ where: { assetId: id }, orderBy: { refueledAt: 'desc' }, take: 20 }),
      db.vehicleDriverAssignment.findMany({ where: { assetId: id }, orderBy: { startAt: 'desc' }, take: 20 }),
      db.vehicleIncident.findMany({ where: { assetId: id }, orderBy: { occurredAt: 'desc' }, take: 20 }),
    ])

    return NextResponse.json({ odometerLogs, fuelLogs, driverAssignments, incidents })
  } catch (error) {
    console.error('Vehicle records error:', error)
    return NextResponse.json({ error: 'Failed to load vehicle records' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { asset, response } = await getVehicleAsset(id)
    if (response) return response

    const recordType = String(body.recordType || '')

    if (recordType === 'odometer') {
      const readingKm = parseOptionalNumber(body.readingKm)
      if (readingKm === null) return NextResponse.json({ error: 'readingKm is required' }, { status: 400 })

      const log = await db.vehicleOdometerLog.create({
        data: {
          assetId: id,
          readingKm,
          readingAt: parseOptionalDate(body.readingAt),
          recordedBy: body.recordedBy || null,
          notes: body.notes || null,
        },
      })

      await db.asset.update({
        where: { id },
        data: { customFields: { ...parseCustomFields(asset!.customFields), mileage: String(readingKm) } },
      })

      await db.timelineEvent.create({
        data: {
          assetId: id,
          eventType: 'inspection',
          title: 'ثبت کیلومتر خودرو',
          description: `${readingKm.toLocaleString()} کیلومتر برای ${asset!.nameFa} ثبت شد`,
          relatedId: log.id,
          relatedType: 'vehicle_odometer',
        },
      })

      return NextResponse.json(log, { status: 201 })
    }

    if (recordType === 'fuel') {
      const liters = parseOptionalNumber(body.liters)
      if (liters === null) return NextResponse.json({ error: 'liters is required' }, { status: 400 })
      const odometerKm = parseOptionalNumber(body.odometerKm)

      const log = await db.vehicleFuelLog.create({
        data: {
          assetId: id,
          fuelType: body.fuelType || null,
          liters,
          cost: parseOptionalNumber(body.cost),
          odometerKm,
          station: body.station || null,
          invoiceNumber: body.invoiceNumber || null,
          refueledAt: parseOptionalDate(body.refueledAt),
          notes: body.notes || null,
        },
      })

      if (odometerKm !== null) {
        await db.asset.update({
          where: { id },
          data: { customFields: { ...parseCustomFields(asset!.customFields), mileage: String(odometerKm) } },
        })
      }

      return NextResponse.json(log, { status: 201 })
    }

    if (recordType === 'driverAssignment') {
      if (!body.driverName) return NextResponse.json({ error: 'driverName is required' }, { status: 400 })

      await db.vehicleDriverAssignment.updateMany({
        where: { assetId: id, status: 'active' },
        data: { status: 'closed', endAt: new Date() },
      })

      const assignment = await db.vehicleDriverAssignment.create({
        data: {
          assetId: id,
          driverName: body.driverName,
          driverCode: body.driverCode || null,
          driverPhone: body.driverPhone || null,
          mission: body.mission || null,
          startAt: parseOptionalDate(body.startAt),
          endAt: body.endAt ? new Date(body.endAt) : null,
          status: body.status || 'active',
          notes: body.notes || null,
        },
      })

      await db.timelineEvent.create({
        data: {
          assetId: id,
          eventType: 'assignment',
          title: 'تخصیص راننده به خودرو',
          description: `${body.driverName} به ${asset!.nameFa} تخصیص داده شد`,
          relatedId: assignment.id,
          relatedType: 'vehicle_assignment',
        },
      })

      return NextResponse.json(assignment, { status: 201 })
    }

    if (recordType === 'incident') {
      if (!body.description) return NextResponse.json({ error: 'description is required' }, { status: 400 })

      const incident = await db.vehicleIncident.create({
        data: {
          assetId: id,
          type: body.type || 'incident',
          occurredAt: parseOptionalDate(body.occurredAt),
          driverName: body.driverName || null,
          description: body.description,
          cost: parseOptionalNumber(body.cost),
          insuranceUsed: Boolean(body.insuranceUsed),
          status: body.status || 'open',
          notes: body.notes || null,
        },
      })

      await db.timelineEvent.create({
        data: {
          assetId: id,
          eventType: 'fault',
          title: body.type === 'violation' ? 'ثبت تخلف خودرو' : 'ثبت حادثه خودرو',
          description: body.description,
          relatedId: incident.id,
          relatedType: 'vehicle_incident',
        },
      })

      return NextResponse.json(incident, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid recordType' }, { status: 400 })
  } catch (error) {
    console.error('Create vehicle record error:', error)
    return NextResponse.json({ error: 'Failed to create vehicle record' }, { status: 500 })
  }
}
