const { withSentryConfig } = require("@sentry/nextjs");
const { NormalModuleReplacementPlugin } = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // see https://github.com/sindresorhus/got/issues/2267#issuecomment-1659768856
    config.ignoreWarnings = [{ module: /node_modules\/keyv\/src\/index\.js/ }]

    // see https://github.com/rainbow-me/rainbowkit/blob/main/examples/with-next-app/next.config.js
    config.resolve.fallback = { fs: false, net: false, tls: false, crypto: false }
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'bufferutil', 'utf-8-validate')

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    config.plugins.push(
      new NormalModuleReplacementPlugin(/node:/, resource => {
        resource.request = resource.request.replace(/^node:/, '')
      })
    )

    return config
  },
}

const { SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN } = process.env

if (SENTRY_ORG && SENTRY_PROJECT && SENTRY_AUTH_TOKEN) {
  module.exports = withSentryConfig(nextConfig, {
    org: SENTRY_ORG,
    project: SENTRY_PROJECT,
    authToken: SENTRY_AUTH_TOKEN,
    silent: true,
    hideSourceMaps: true,
    tunnelRoute: "/monitoring-tunnel",
    disableLogger: true,
  })
} else {
  module.exports = nextConfig
}