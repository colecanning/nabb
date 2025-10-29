export interface TranscriptionResult {
  success: boolean;
  transcription: string;
  data: any;
}

export interface TranscriptionError {
  success: false;
  error: string;
  details?: any;
}

/**
 * Transcribes a video using OpenAI's Whisper API
 * @param videoUrl - The URL of the video to transcribe
 * @returns Promise resolving to transcription result or throwing an error
 */
export async function transcribeVideo(videoUrl: string): Promise<TranscriptionResult> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    const error: TranscriptionError = {
      success: false,
      error: 'OpenAI API key not configured'
    };
    throw error;
  }

  // Download the video file
  console.log('Downloading video from:', videoUrl);
  const videoResponse = await fetch(videoUrl);
  
  if (!videoResponse.ok) {
    const error: TranscriptionError = {
      success: false,
      error: 'Failed to download video file'
    };
    throw error;
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
    const error: TranscriptionError = {
      success: false,
      error: 'Failed to transcribe video',
      details: errorData
    };
    throw error;
  }

  const transcriptionData = await whisperResponse.json();
  
  return {
    success: true,
    transcription: transcriptionData.text,
    data: transcriptionData,
  };
}

