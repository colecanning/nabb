import { NextRequest, NextResponse } from 'next/server';
import { searchEntityWithSerp } from '@/lib/backend/serp-search';
import type { Entity } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const entity: Entity = await request.json();

    if (!entity || !entity.name) {
      return NextResponse.json(
        { success: false, error: 'Entity with name field is required' },
        { status: 400 }
      );
    }

    const entityWithUrls = await searchEntityWithSerp(entity);
    
    return NextResponse.json({
      success: true,
      entity: entityWithUrls,
      urls: entityWithUrls.urls || [],
      count: entityWithUrls.urls?.length || 0
    });

  } catch (error) {
    console.error('Entity search error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to search for entity';
    
    // Determine appropriate status code based on error message
    let status = 500;
    if (errorMessage.includes('timed out')) {
      status = 504;
    } else if (errorMessage.includes('No search results found')) {
      status = 404;
    } else if (errorMessage.includes('not configured')) {
      status = 500;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status }
    );
  }
}

