/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'pg', 'pdfkit', 'nodemailer', 'bcryptjs'],
  },
};

export default nextConfig;

