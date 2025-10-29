import { NextRequest, NextResponse } from 'next/server';
import { transcribeVideo, TranscriptionError } from '@/lib/backend/video-transcription';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const result = await transcribeVideo(videoUrl);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Check if it's a custom transcription error with specific handling
    if (typeof error === 'object' && error !== null && 'success' in error) {
      const transcriptionError = error as TranscriptionError;
      
      // Determine appropriate status code based on error message
      if (transcriptionError.error.includes('not configured')) {
        return NextResponse.json(transcriptionError, { status: 500 });
      } else if (transcriptionError.error.includes('Failed to download')) {
        return NextResponse.json(transcriptionError, { status: 400 });
      } else if (transcriptionError.details) {
        // Whisper API error with details - return 500 as it's an external API failure
        return NextResponse.json(transcriptionError, { status: 500 });
      } else {
        return NextResponse.json(transcriptionError, { status: 400 });
      }
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to transcribe video'
      },
      { status: 500 }
    );
  }
}

