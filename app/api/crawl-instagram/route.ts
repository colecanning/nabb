import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

    // Get the page content after JavaScript execution
    const html = await page.content();
    
    console.log('HTML length:', html.length);
    console.log('First 500 chars:', html.substring(0, 500));
    
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
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      description: description,
      url: url,
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

