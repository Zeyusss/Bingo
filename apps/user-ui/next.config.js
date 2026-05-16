//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/product/api/:path*",
        destination: "http://localhost:8080/product/api/:path*",
      },
      {
        source: "/seller/api/:path*",
        destination: "http://localhost:8080/seller/api/:path*",
      },
      {
        source: "/order/api/:path*",
        destination: "http://localhost:8080/order/api/:path*",
      },
      {
        source: "/admin/api/:path*",
        destination: "http://localhost:8080/admin/api/:path*",
      },
      {
        source: "/chatting/api/:path*",
        destination: "http://localhost:8080/chatting/api/:path*",
      },
      {
        source: "/recommendation/api/:path*",
        destination: "http://localhost:8080/recommendation/api/:path*",
      },
    ];
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
