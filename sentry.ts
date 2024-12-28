import packageJson from './package.json'

export const sentryConfig = { 
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: `${packageJson.name}@${packageJson.version}`,
  environment: process.env.NEXT_PUBLIC_APP_MODE,
}