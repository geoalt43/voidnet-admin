import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Blog } from '@/models/Blog';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    
    const query = platform ? { platform } : {};
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, slug, description, image, content, platform, metaTitle, metaDescription, tags } = body;
    
    const blog = await Blog.create({
      title,
      slug,
      description,
      image,
      content,
      platform,
      metaTitle,
      metaDescription,
      tags: tags || [],
    });
    
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}