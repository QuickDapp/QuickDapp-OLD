import { ClientConfigInterface, clientConfig } from './client'

const LOG_LEVELS = ['error', 'warn', 'info', 'debug', 'trace'] as const

export interface ServerConfigInterface extends ClientConfigInterface {
  LOG_LEVEL: string
  TX_BLOCK_CONFIRMATIONS_REQUIRED: number
  WORKER_LOG_LEVEL: string
  DATABASE_URL: string
  SESSION_ENCRYPTION_KEY: string
  NEXTAUTH_URL: string
  SERVER_WALLET_PRIVATE_KEY: string
  SERVER_CHAIN_RPC_ENDPOINT: string
  MAILGUN_API_KEY?: string
  MAILGUN_API_ENDPOINT?: string
  MAILGUN_FROM_ADDRESS?: string
  ABLY_API_KEY?: string
  DIGITALOCEAN_ACCESS_TOKEN?: string
  SENTRY_ORG?: string
  SENTRY_PROJECT?: string
  SENTRY_AUTH_TOKEN?: string
}

export const serverConfig = (() => {
  const env = require('env-var').from({
    DATABASE_URL: process.env.DATABASE_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    WORKER_LOG_LEVEL: process.env.WORKER_LOG_LEVEL,
    SESSION_ENCRYPTION_KEY: process.env.SESSION_ENCRYPTION_KEY,
    SERVER_WALLET_PRIVATE_KEY: process.env.SERVER_WALLET_PRIVATE_KEY,
    SERVER_CHAIN_RPC_ENDPOINT: process.env.SERVER_CHAIN_RPC_ENDPOINT,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_API_ENDPOINT: process.env.MAILGUN_API_ENDPOINT,
    MAILGUN_FROM_ADDRESS: process.env.MAILGUN_FROM_ADDRESS,
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    DIGITALOCEAN_ACCESS_TOKEN: process.env.DIGITALOCEAN_ACCESS_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  })

  try {
    const ret = {
      ...clientConfig,
      DATABASE_URL: env.get('DATABASE_URL').required().asString(),
      LOG_LEVEL: env.get('LOG_LEVEL').default('debug').asEnum(LOG_LEVELS),
      WORKER_LOG_LEVEL: env.get('WORKER_LOG_LEVEL').default('debug').asEnum(LOG_LEVELS),
      SESSION_ENCRYPTION_KEY: env.get('SESSION_ENCRYPTION_KEY').required().asString(),      
      NEXTAUTH_URL: clientConfig.NEXT_PUBLIC_BASE_URL,
      SERVER_WALLET_PRIVATE_KEY: env.get('SERVER_WALLET_PRIVATE_KEY').required().asString(),
      SERVER_CHAIN_RPC_ENDPOINT: env.get('SERVER_CHAIN_RPC_ENDPOINT').required().asString(),
      MAILGUN_API_KEY: env.get('MAILGUN_API_KEY').default('').asString(),
      MAILGUN_API_ENDPOINT: env.get('MAILGUN_API_ENDPOINT').default('').asString(),
      MAILGUN_FROM_ADDRESS: env.get('MAILGUN_FROM_ADDRESS').default('').asString(),
      ABLY_API_KEY: env.get('ABLY_API_KEY').default('').asString(),
      SENTRY_ORG: env.get('SENTRY_ORG').default('').asString(),
      SENTRY_PROJECT: env.get('SENTRY_PROJECT').default('').asString(),
      SENTRY_AUTH_TOKEN: env.get('SENTRY_AUTH_TOKEN').default('').asString(),
      DIGITALOCEAN_ACCESS_TOKEN: env.get('DIGITALOCEAN_ACCESS_TOKEN').default('').asString(),
    } as ServerConfigInterface

    return Object.freeze(ret) 
  } catch (err) {
    console.error(`Error loading server-side config`)
    console.error(err)
    throw err
  }
})()
