import { NextRequest, NextResponse } from 'next/server';
import { getVideoDuration, VideoDurationError } from '@/lib/backend/video-duration';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const result = await getVideoDuration(videoUrl);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Get video duration error:', error);
    
    // Check if it's the custom error (could not extract duration)
    if (typeof error === 'object' && error !== null && 'success' in error) {
      const durationError = error as VideoDurationError;
      return NextResponse.json(durationError, { status: 404 });
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get video duration'
      },
      { status: 500 }
    );
  }
}

