/** @type {import('next').NextConfig} */
const nextConfig = {
  /*   reactStrictMode: true,
   */ swcMinify: true,
  images: {
    domains: ["localhost", "icons8.com"],
  },
};

module.exports = nextConfig;
