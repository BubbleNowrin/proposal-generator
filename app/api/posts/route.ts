import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Post from '../../../models/Post'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'newest' // newest, oldest, popular, votes
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    
    let query: any = {}
    
    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] }
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    // Set sort order
    let sort: any = {}
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'popular':
        sort = { views: -1, createdAt: -1 }
        break
      case 'votes':
        sort = { 'votes.up': -1, createdAt: -1 }
        break
      default: // newest
        sort = { createdAt: -1 }
    }
    
    const skip = (page - 1) * limit
    
    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query)
    ])
    
    // Calculate vote scores for each post
    const postsWithScores = posts.map(post => ({
      ...post,
      voteScore: (post.votes?.up?.length || 0) - (post.votes?.down?.length || 0)
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        posts: postsWithScores,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasMore: page < Math.ceil(totalPosts / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const data = await request.json()
    const { title, content, images, authorName, authorType, authorId, tags } = data
    
    // Validate required fields
    if (!title || !content || !authorName || !authorType) {
      return NextResponse.json(
        { error: 'Title, content, author name, and author type are required' },
        { status: 400 }
      )
    }
    
    const newPost = new Post({
      title,
      content,
      images: images || [],
      authorId,
      authorName,
      authorType,
      tags: tags || [],
      views: 0,
      votes: { up: [], down: [] },
      commentCount: 0,
      isResolved: false
    })
    
    await newPost.save()
    
    // Save user activity if user is logged in
    if (authorId) {
      try {
        const UserActivity = require('../../../models/UserActivity').default
        await new UserActivity({
          userId: authorId,
          activityType: 'post_created',
          targetType: 'post',
          targetId: newPost._id.toString(),
          targetTitle: title,
          metadata: {
            postTitle: title
          }
        }).save()
      } catch (activityError) {
        console.error('Error saving user activity:', activityError)
        // Don't fail the post creation if activity logging fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: newPost
    })
    
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}