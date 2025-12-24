/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

// PWA configuration - use custom SW with push support
const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  swSrc: "public/sw-custom.js", // Custom SW with push event listener
});

const nextConfig = {
  // eslint: {
  //     ignoreDuringBuilds: true,
  // },
  // typescript: {
  //     ignoreBuildErrors: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withPWAConfig(nextConfig);
