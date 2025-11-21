import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // This endpoint is deprecated - we now use manual job entry
  // Keeping it for backward compatibility
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Please use manual job entry instead.' },
    { status: 410 }
  )
}