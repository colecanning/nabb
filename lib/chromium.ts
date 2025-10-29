// Chromium configuration for Vercel deployment
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function getBrowser() {
  // Check if we're running on Vercel (serverless)
  const isProduction = process.env.VERCEL === '1';

  if (isProduction) {
    // Use chromium for Vercel with version 126.0.0 (stable version)
    // Set headless shell mode to avoid missing library issues
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode = false;
    
    const executablePath = await chromium.executablePath();
    
    return await puppeteer.launch({
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: true,
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

