/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude these packages from webpack bundling in Server Components
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium", "@sparticuz/chromium-min", "puppeteer-core"],
  },
};

module.exports = nextConfig;

