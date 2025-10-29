import { NextRequest, NextResponse } from 'next/server';
import { getBrowser } from '@/lib/chromium';
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

    // Launch headless browser (works on both local and Vercel)
    browser = await getBrowser();

    const page = await browser.newPage();
    
    // Set default timeout for all page operations (important for Vercel cold starts)
    page.setDefaultTimeout(60000); // 60 seconds
    page.setDefaultNavigationTimeout(60000); // 60 seconds for navigation
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page with increased timeout for Vercel
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000, // Increased from 15s to 30s for cold starts
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
    let title = null;
    
    // Try multiple patterns to find title
    const titlePatterns = [
      // Standard meta title
      /<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']title["']/i,
      // Open Graph title
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i,
      // Twitter title
      /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:title["']/i,
      // HTML title tag as fallback
      /<title>([^<]+)<\/title>/i,
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        title = match[1];
        console.log('Found title with pattern:', pattern.source);
        break;
      }
    }
    
    // Extract content between &quot; entities if present
    if (title && title.includes('&quot;')) {
      const quotedContentMatch = title.match(/&quot;([^&]+)&quot;/);
      if (quotedContentMatch && quotedContentMatch[1]) {
        title = quotedContentMatch[1].trim();
        console.log('Extracted quoted title content:', title);
      }
    }
    
    // Try multiple patterns to find description
    const descriptionPatterns = [
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
    
    for (const pattern of descriptionPatterns) {
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
            title: title,
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

    return NextResponse.json({
      success: true,
      title: title,
      description: description,
      videoUrl: videoUrl,
      url: url,
      debug: {
        htmlLength: html.length,
        foundVideoUrl: !!videoUrl,
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

