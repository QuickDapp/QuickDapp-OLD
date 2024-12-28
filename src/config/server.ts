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
  OTEL_SERVICE_NAME?: string
  OTEL_WORKER_SERVICE_NAME?: string
  OTEL_EXPORTER_OTLP_PROTOCOL?: string
  OTEL_EXPORTER_OTLP_ENDPOINT?: string
  OTEL_EXPORTER_OTLP_HEADERS?: string
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
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    OTEL_WORKER_SERVICE_NAME: process.env.OTEL_WORKER_SERVICE_NAME,
    OTEL_EXPORTER_OTLP_PROTOCOL: process.env.OTEL_EXPORTER_OTLP_PROTOCOL,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
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
      DIGITALOCEAN_ACCESS_TOKEN: env.get('DIGITALOCEAN_ACCESS_TOKEN').default('').asString(),
      OTEL_SERVICE_NAME: env.get('OTEL_SERVICE_NAME').default('').asString(),
      OTEL_WORKER_SERVICE_NAME: env.get('OTEL_WORKER_SERVICE_NAME').default('').asString(),
      OTEL_EXPORTER_OTLP_PROTOCOL: env.get('OTEL_EXPORTER_OTLP_PROTOCOL').default('').asString(),
      OTEL_EXPORTER_OTLP_ENDPOINT: env.get('OTEL_EXPORTER_OTLP_ENDPOINT').default('').asString(),
      OTEL_EXPORTER_OTLP_HEADERS: env.get('OTEL_EXPORTER_OTLP_HEADERS').default('').asString(),
    } as ServerConfigInterface

    return Object.freeze(ret) 
  } catch (err) {
    console.error(`Error loading server-side config`)
    console.error(err)
    throw err
  }
})()
