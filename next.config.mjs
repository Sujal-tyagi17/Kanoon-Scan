/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
  transpilePackages: ['pdfjs-dist'],
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    if (isServer) {
      config.externals = [...(config.externals || []), 'pdfjs-dist'];
    }
    return config;
  },
};

export default nextConfig;
