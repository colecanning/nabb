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

