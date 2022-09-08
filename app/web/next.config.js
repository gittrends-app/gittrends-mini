/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

/** @type {import('next-transpile-modules')} */
const transpile = require('next-transpile-modules');

module.exports = transpile(['@gittrends/lib'])(nextConfig);
