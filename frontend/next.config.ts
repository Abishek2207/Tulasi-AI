/** @type {import('next').NextConfig} */


const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  async redirects() {
    return [
      {
        source: '/dashboard/roadmap',
        destination: '/dashboard/personalized-roadmap',
        permanent: true,
      },
      {
        source: '/dashboard/roadmaps',
        destination: '/dashboard/personalized-roadmap',
        permanent: true,
      },
      {
        source: '/dashboard/dsa',
        destination: '/dashboard/dsa-agent',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
