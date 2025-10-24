import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Crawling Instagram URL with Puppeteer:', url);

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page with timeout
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });
    } catch (error) {
      console.error('Navigation error:', error);
      await browser.close();
      return NextResponse.json(
        { success: false, error: 'Failed to load Instagram page. It may be taking too long to respond.' },
        { status: 504 }
      );
    }

    // Wait a bit longer for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the page content after JavaScript execution
    const html = await page.content();
    
    console.log('HTML length:', html.length);
    console.log('First 500 chars:', html.substring(0, 500));
    
    // Save HTML to file for debugging
    try {
      const debugDir = join(process.cwd(), 'public', 'debug');
      if (!existsSync(debugDir)) {
        await mkdir(debugDir, { recursive: true });
      }
      const timestamp = Date.now();
      const htmlPath = join(debugDir, `instagram_${timestamp}.html`);
      await writeFile(htmlPath, html);
      console.log('Saved HTML to:', htmlPath);
    } catch (err) {
      console.error('Failed to save debug HTML:', err);
    }
    
    let description = null;
    
    // Try multiple patterns to find description
    const patterns = [
      // Standard meta description
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i,
      // Open Graph description
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i,
      // Twitter description
      /<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:description["']/i,
      // Look for any meta tag with "description" in property
      /<meta\s+property=["'][^"']*description[^"']*["']\s+content=["']([^"']+)["']/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        description = match[1];
        console.log('Found description with pattern:', pattern.source);
        break;
      }
    }
    
    // Extract content between &quot; entities if present
    if (description && description.includes('&quot;')) {
      const quotedContentMatch = description.match(/&quot;([^&]+)&quot;/);
      if (quotedContentMatch && quotedContentMatch[1]) {
        description = quotedContentMatch[1].trim();
        console.log('Extracted quoted content:', description);
      }
    }
    
    // Try to extract video URL from Instagram's JSON data
    let videoUrl = null;
    
    console.log('Searching for video URL in HTML (length:', html.length, ')');
    
    // Instagram embeds video data in <script type="application/json"> tags
    // Look for "video_versions" array which contains the actual video URLs
    const videoVersionsMatch = html.match(/"video_versions"\s*:\s*\[([^\]]+)\]/);
    
    if (videoVersionsMatch) {
      console.log('Found video_versions array in JSON');
      const videoVersionsStr = videoVersionsMatch[0];
      
      // Extract URL from the first video version
      const urlMatch = videoVersionsStr.match(/"url"\s*:\s*"([^"]+)"/);
      if (urlMatch && urlMatch[1]) {
        // Unescape the URL (Instagram uses \/ for forward slashes)
        videoUrl = urlMatch[1]
          .replace(/\\\//g, '/')
          .replace(/\\u0026/g, '&')
          .replace(/\\"/g, '"');
        
        console.log('✅ Extracted video URL from video_versions:', videoUrl.substring(0, 100) + '...');
      }
    }
    
    // Fallback: Look for og:video meta tag
    if (!videoUrl) {
      console.log('Trying og:video meta tags as fallback...');
      const ogVideoPatterns = [
        /<meta\s+property=["']og:video["']\s+content=["']([^"']+)["']/i,
        /<meta\s+content=["']([^"']+)["']\s+property=["']og:video["']/i,
        /<meta\s+property=["']og:video:secure_url["']\s+content=["']([^"']+)["']/i,
      ];
      
      for (const pattern of ogVideoPatterns) {
        const match = html.match(pattern);
        if (match && match[1] && !match[1].startsWith('blob:')) {
          videoUrl = match[1];
          console.log('Found video URL in og:video meta tag:', videoUrl);
          break;
        }
      }
    }
    
    if (!description) {
      // Extract a snippet of meta tags for debugging
      const metaTagsMatch = html.match(/<head>[\s\S]*?<\/head>/i);
      const headContent = metaTagsMatch ? metaTagsMatch[0].substring(0, 1000) : 'No head tag found';
      
      await browser.close();
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not find description meta tag',
          debug: {
            htmlLength: html.length,
            headSnippet: headContent,
            hasMetaTags: html.includes('<meta'),
            videoUrl: videoUrl,
            hasScriptTags: html.includes('<script'),
          }
        },
        { status: 404 }
      );
    }
    
    // Log if no video URL found for debugging
    if (!videoUrl) {
      console.log('⚠️ Warning: No video URL found');
      console.log('Sample of HTML:', html.substring(0, 2000));
    }

    // Get video duration using a video element in the browser
    let videoDuration = null;
    
    if (videoUrl) {
      try {
        console.log('Getting video duration from video element...');
        
        // Use Puppeteer to load the video and get its duration
        // This reads just the video metadata, not the full video
        videoDuration = await page.evaluate(async (url) => {
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
        
        if (videoDuration) {
          console.log('✅ Video duration:', videoDuration, 'seconds');
        } else {
          console.log('⚠️ Could not get video duration');
        }
      } catch (error) {
        console.error('⚠️ Failed to get video duration:', error instanceof Error ? error.message : error);
        // Continue even if duration extraction fails - duration is optional
      }
    }

    // Download the video if URL was found
    let downloadedVideoPath = null;
    
    if (videoUrl) {
      try {
        console.log('Downloading video from:', videoUrl);
        
        // Create downloads directory if it doesn't exist
        const downloadsDir = join(process.cwd(), 'public', 'downloads');
        if (!existsSync(downloadsDir)) {
          await mkdir(downloadsDir, { recursive: true });
        }
        
        // Generate filename from URL or timestamp
        const timestamp = Date.now();
        const reelId = url.split('/reel/')[1]?.split('/')[0] || timestamp;
        const filename = `reel_${reelId}_${timestamp}.mp4`;
        const filepath = join(downloadsDir, filename);
        
        // Download the video
        const videoResponse = await fetch(videoUrl);
        if (videoResponse.ok) {
          const buffer = await videoResponse.arrayBuffer();
          await writeFile(filepath, Buffer.from(buffer));
          downloadedVideoPath = `/downloads/${filename}`;
          console.log('Video downloaded to:', downloadedVideoPath);
        } else {
          console.error('Failed to download video:', videoResponse.status);
        }
      } catch (downloadError) {
        console.error('Error downloading video:', downloadError);
        // Continue even if download fails
      }
    }

    return NextResponse.json({
      success: true,
      description: description,
      videoUrl: videoUrl,
      downloadedVideoPath: downloadedVideoPath,
      videoDuration: videoDuration,
      url: url,
      debug: {
        htmlLength: html.length,
        foundVideoUrl: !!videoUrl,
        foundDuration: !!videoDuration,
      }
    });

  } catch (error) {
    console.error('Instagram crawl error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl Instagram URL'
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

