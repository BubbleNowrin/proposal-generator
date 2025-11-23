import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import ProposalHistory from '../../../models/ProposalHistory'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get all proposals for user, sorted by creation date
    const proposals = await ProposalHistory.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    // Categorize by time periods
    const now = new Date()
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const categorizedProposals = {
      past24Hours: proposals.filter(p => new Date(p.createdAt) >= past24Hours),
      past7Days: proposals.filter(p => new Date(p.createdAt) >= past7Days && new Date(p.createdAt) < past24Hours),
      past30Days: proposals.filter(p => new Date(p.createdAt) >= past30Days && new Date(p.createdAt) < past7Days)
    }

    return NextResponse.json({
      success: true,
      data: categorizedProposals,
      totalCount: proposals.length
    })

  } catch (error) {
    console.error('Error fetching proposal history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposal history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const proposalData = await request.json()
    
    const newProposal = new ProposalHistory(proposalData)
    await newProposal.save()

    return NextResponse.json({
      success: true,
      data: newProposal
    })

  } catch (error) {
    console.error('Error saving proposal history:', error)
    return NextResponse.json(
      { error: 'Failed to save proposal history' },
      { status: 500 }
    )
  }
}