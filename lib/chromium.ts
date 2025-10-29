// Chromium configuration for Vercel deployment
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function getBrowser() {
  // Check if we're running on Vercel (serverless)
  const isProduction = process.env.VERCEL === '1';

  if (isProduction) {
    // Use chromium for Vercel
    const executablePath = await chromium.executablePath();
    
    return await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: { width: 1280, height: 800 },
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

