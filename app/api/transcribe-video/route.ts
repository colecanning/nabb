import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Download the video file
    console.log('Downloading video from:', videoUrl);
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to download video file' },
        { status: 400 }
      );
    }

    const videoBlob = await videoResponse.blob();
    
    // Create form data for OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', videoBlob, 'video.mp4');
    formData.append('model', 'whisper-1');

    // Call OpenAI Whisper API
    console.log('Sending to Whisper API...');
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.json();
      console.error('Whisper API error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to transcribe video',
          details: errorData
        },
        { status: whisperResponse.status }
      );
    }

    const transcriptionData = await whisperResponse.json();
    
    return NextResponse.json({
      success: true,
      transcription: transcriptionData.text,
      data: transcriptionData,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to transcribe video'
      },
      { status: 500 }
    );
  }
}

