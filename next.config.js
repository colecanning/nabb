/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude these packages from webpack bundling in Server Components
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  },
};

module.exports = nextConfig;

