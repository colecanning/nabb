// Chromium configuration for Vercel deployment
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function getBrowser() {
  // Check if we're running on Vercel (serverless)
  const isProduction = process.env.VERCEL === '1';

  if (isProduction) {
    // Use chromium for Vercel with version 119.0.2 (most stable for Lambda)
    const executablePath = await chromium.executablePath();
    
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
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

