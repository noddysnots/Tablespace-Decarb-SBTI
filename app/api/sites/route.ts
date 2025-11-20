import { NextRequest, NextResponse } from 'next/server'
import { generateSeedData } from '@/lib/data/ingest'

// GET /api/sites - Fetch all sites
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    // For MVP, return seed data
    const seedData = await generateSeedData()
    return NextResponse.json(seedData.sites)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }
}

// POST /api/sites - Create a new site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // In production, save to database
    // For MVP, just return the data
    return NextResponse.json(body, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}

