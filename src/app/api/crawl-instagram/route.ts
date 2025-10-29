import { NextRequest, NextResponse } from 'next/server';
import { crawlInstagramUrl, InstagramCrawlError } from '@/lib/backend/instagram-crawler';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await crawlInstagramUrl(url);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Instagram crawl error:', error);
    
    // Check if it's a navigation timeout error
    if (error instanceof Error && error.message.includes('Failed to load Instagram page')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 504 }
      );
    }
    
    // Check if it's the custom error with debug info (no description found)
    if (typeof error === 'object' && error !== null && 'success' in error) {
      const crawlError = error as InstagramCrawlError;
      return NextResponse.json(crawlError, { status: 404 });
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Instagram URL'
      },
      { status: 500 }
    );
  }
}

