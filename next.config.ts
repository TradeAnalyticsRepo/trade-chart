import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  env: {
    APP_KEY: process.env.APP_KEY,
    APP_SECRET: process.env.APP_SECRET,
  },
};

export default nextConfig;
