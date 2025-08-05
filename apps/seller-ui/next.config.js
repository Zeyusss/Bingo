//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');


/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  images:{
    remotePatterns:[
      {
        hostname : "ik.imagekit.io",
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/product/api/:path*',
        destination: 'http://localhost:8080/product/api/:path*',
      },
      {
        source: '/seller/api/:path*',
        destination: 'http://localhost:8080/seller/api/:path*',
      },
      {
        source: '/order/api/:path*',
        destination: 'http://localhost:8080/order/api/:path*',
      },
      {
        source: '/admin/api/:path*',
        destination: 'http://localhost:8080/admin/api/:path*',
      },
      {
        source: '/chatting/api/:path*',
        destination: 'http://localhost:8080/chatting/api/:path*',
      },
    ];
  },
}


const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);

