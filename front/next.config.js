/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['packages/private-market-utils'],
};

module.exports = nextConfig;
