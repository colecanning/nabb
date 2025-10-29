import { NextRequest, NextResponse } from 'next/server';
import { getBrowser } from '@/lib/chromium';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

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
    // @ts-expect-error - puppeteer-core 23.x has type issues with evaluate, but this works at runtime
    const videoDuration = await page.evaluate((url: string) => {
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
    }, videoUrl);
    
    await browser.close();
    
    if (videoDuration) {
      console.log('✅ Video duration:', videoDuration, 'seconds');
      return NextResponse.json({
        success: true,
        duration: videoDuration,
        videoUrl: videoUrl,
      });
    } else {
      console.log('⚠️ Could not get video duration');
      return NextResponse.json(
        { success: false, error: 'Could not extract video duration' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Get video duration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get video duration'
      },
      { status: 500 }
    );
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

