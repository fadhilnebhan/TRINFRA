/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db'],
    },
  },
  async redirects() {
    return [
      {
        source: '/register-your-land',
        destination: '/register',
        permanent: true,
      },
      {
        source: '/developer-enquiry',
        destination: '/enquiry',
        permanent: true,
      },
      {
        source: '/admin/developer-enquiries',
        destination: '/admin/enquiries',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

