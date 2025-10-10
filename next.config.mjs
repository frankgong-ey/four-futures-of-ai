const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;


