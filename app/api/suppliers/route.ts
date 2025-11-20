import { NextRequest, NextResponse } from 'next/server'
import { generateSeedData } from '@/lib/data/ingest'

// GET /api/suppliers - Fetch all suppliers
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    // For MVP, return seed data
    const seedData = await generateSeedData()
    return NextResponse.json(seedData.suppliers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // In production, save to database
    // For MVP, just return the data
    return NextResponse.json(body, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}

