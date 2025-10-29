export interface CrawlInstagramResult {
  success?: boolean;
  title?: string;
  description?: string;
  videoUrl?: string;
  error?: string;
  debug?: any;
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

