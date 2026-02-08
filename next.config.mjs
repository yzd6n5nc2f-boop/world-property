/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  staticPageGenerationTimeout: 300,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
