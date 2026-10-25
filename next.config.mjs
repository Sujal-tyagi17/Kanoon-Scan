/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "utfs.io" }],
  },
  experimental: {
    // Keep these as plain Node modules on the server instead of bundling them
    serverComponentsExternalPackages: ["mammoth"],
  },
};

export default nextConfig;
