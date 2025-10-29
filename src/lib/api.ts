import { SearchResult } from './store';

export interface CrawlInstagramResult {
  success?: boolean;
  title?: string;
  description?: string;
  videoUrl?: string;
  error?: string;
  debug?: any;
}

export interface SearchInstagramReelsResult {
  success: boolean;
  results?: SearchResult[];
  error?: string;
}

export async function crawlInstagram(url: string): Promise<CrawlInstagramResult> {
  const res = await fetch('/api/crawl-instagram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();
  return data;
}

export async function getVideoDuration(videoUrl: string): Promise<number | null> {
  const res = await fetch('/api/get-video-duration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl }),
  });

  const data = await res.json();
  
  if (data.success && data.duration) {
    return data.duration;
  }
  
  return null;
}

export async function transcribeVideo(videoUrl: string): Promise<string | null> {
  const res = await fetch('/api/transcribe-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl }),
  });

  const data = await res.json();
  
  if (data.success && data.transcription) {
    return data.transcription;
  }
  
  return null;
}

export async function searchInstagramReels(query: string): Promise<SearchInstagramReelsResult> {
  try {
    const res = await fetch('/api/search-serp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    
    if (data.success) {
      return {
        success: true,
        results: data.results || [],
      };
    } else {
      return {
        success: false,
        error: data.error || 'Unknown error',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search',
    };
  }
}

