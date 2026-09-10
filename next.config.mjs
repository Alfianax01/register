/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'pg', 'pdfkit', 'nodemailer', 'bcryptjs'],
    workerThreads: true,
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;

