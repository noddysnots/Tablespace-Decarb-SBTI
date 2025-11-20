import { NextRequest, NextResponse } from 'next/server'

// GET /api/scenarios - Fetch all scenarios
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    // For MVP, return empty array
    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
  }
}

// POST /api/scenarios - Create a new scenario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // In production, save to database
    // For MVP, just return the data
    return NextResponse.json(body, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 })
  }
}

