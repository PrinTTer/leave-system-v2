/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // DEV only: rewrite /api -> backend dev server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/', // your Nest dev server
      },
    ];
  },
};

module.exports = nextConfig;
