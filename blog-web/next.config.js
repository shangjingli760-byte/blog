/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

// 仅生产构建启用静态导出
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
}

module.exports = nextConfig;
