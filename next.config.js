/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Empty turbopack config to silence the warning
  turbopack: {},
};

module.exports = nextConfig;
