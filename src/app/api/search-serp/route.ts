import { NextRequest, NextResponse } from 'next/server';
import { searchWithSerp, SerpSearchError } from '@/lib/backend/serp-search';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const result = await searchWithSerp(query);
    return NextResponse.json(result);

  } catch (error) {
    console.error('SERP API search error:', error);
    
    // Check if it's a custom SERP error with specific handling
    if (typeof error === 'object' && error !== null && 'success' in error) {
      const serpError = error as SerpSearchError;
      
      // Determine appropriate status code based on error message
      if (serpError.error.includes('timed out')) {
        return NextResponse.json(serpError, { status: 504 });
      } else if (serpError.error.includes('No search results found')) {
        return NextResponse.json(serpError, { status: 404 });
      } else if (serpError.error.includes('not configured')) {
        return NextResponse.json(serpError, { status: 500 });
      } else if (serpError.details) {
        // SerpAPI error with details - try to parse status from error message
        const statusMatch = serpError.error.match(/\((\d+)\)/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 400;
        return NextResponse.json(serpError, { status });
      } else {
        return NextResponse.json(serpError, { status: 400 });
      }
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform SERP API search'
      },
      { status: 500 }
    );
  }
}

