// Chromium configuration for Vercel deployment
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function getBrowser() {
  // Check if we're running on Vercel (serverless)
  const isProduction = process.env.VERCEL === '1';

  if (isProduction) {
    // Use chromium for Vercel with version 119.0.2 (most stable for Lambda)
    // IMPORTANT: Increase timeout for chromium binary extraction on cold starts
    const executablePath = await chromium.executablePath();
    
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      // Increase timeout to 60 seconds for browser launch (default is 30s)
      // This is critical for Vercel cold starts when chromium needs to be extracted
      timeout: 60000,
      protocolTimeout: 60000,
    });
  } else {
    // Use local Chromium for development
    // This requires puppeteer (not puppeteer-core) installed
    const puppeteerFull = await import('puppeteer');
    return await puppeteerFull.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
}

