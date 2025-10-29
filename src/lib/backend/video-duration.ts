import { getBrowser } from '@/lib/backend/chromium';

export interface VideoDurationResult {
  success: boolean;
  duration: number;
  videoUrl: string;
}

export interface VideoDurationError {
  success: false;
  error: string;
}

/**
 * Gets the duration of a video by loading its metadata in a headless browser
 * @param videoUrl - The URL of the video to analyze
 * @returns Promise resolving to video duration result or throwing an error
 */
export async function getVideoDuration(videoUrl: string): Promise<VideoDurationResult> {
  let browser;
  
  try {
    console.log('Getting video duration for:', videoUrl);

    // Launch headless browser (works on both local and Vercel)
    browser = await getBrowser();

    const page = await browser.newPage();
    
    // Set default timeout for all page operations (important for Vercel cold starts)
    page.setDefaultTimeout(60000); // 60 seconds
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Get video duration using a video element in the browser
    console.log('Getting video duration from video element...');
    
    // Use Puppeteer to load the video and get its duration
    // This reads just the video metadata, not the full video
    // @ts-expect-error - puppeteer-core has type issues with evaluate in some versions, but this works at runtime
    const videoDuration = await page.evaluate((url) => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
          resolve(video.duration);
        };
        
        video.onerror = () => {
          resolve(null);
        };
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(null), 10000);
        
        video.src = url;
      });
    }, videoUrl) as Promise<number | null>;
    
    if (videoDuration) {
      console.log('✅ Video duration:', videoDuration, 'seconds');
      return {
        success: true,
        duration: videoDuration,
        videoUrl: videoUrl,
      };
    } else {
      console.log('⚠️ Could not get video duration');
      const error: VideoDurationError = {
        success: false,
        error: 'Could not extract video duration'
      };
      throw error;
    }

  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

