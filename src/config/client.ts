export interface ClientConfigInterface {
  APP_MODE: string
  BASE_URL: string
  WALLETCONNECT_PROJECT_ID: string
  CHAIN: string
  CHAIN_RPC_ENDPOINT: string
  DIAMOND_PROXY_ADDRESS: string
  DATADOG_APPLICATION_ID?: string
  DATADOG_CLIENT_TOKEN?: string
  DATADOG_SITE?: string
  DATADOG_SERVICE?: string
}

export const clientConfig = (() => {
  const env = require('env-var').from({
    APP_MODE: process.env.NEXT_PUBLIC_APP_MODE,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    CHAIN: process.env.NEXT_PUBLIC_CHAIN,
    CHAIN_RPC_ENDPOINT: process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT,
    WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    DIAMOND_PROXY_ADDRESS: process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS,
    DATADOG_APPLICATION_ID: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    DATADOG_CLIENT_TOKEN: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    DATADOG_SITE: process.env.NEXT_PUBLIC_DATADOG_SITE,
    DATADOG_SERVICE: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
  })

  return Object.freeze({
    APP_MODE: env.get('APP_MODE').required().asEnum(['development', 'production']),
    BASE_URL: env.get('BASE_URL').required().asString(),
    CHAIN: env.get('CHAIN').required().asString(),
    CHAIN_RPC_ENDPOINT: env.get('CHAIN_RPC_ENDPOINT').required().asString(),
    WALLETCONNECT_PROJECT_ID: env.get('WALLETCONNECT_PROJECT_ID').required().asString(),
    DIAMOND_PROXY_ADDRESS: env.get('DIAMOND_PROXY_ADDRESS').required().asString(),
    DATADOG_APPLICATION_ID: env.get('DATADOG_APPLICATION_ID').default('').asString(),
    DATADOG_CLIENT_TOKEN: env.get('DATADOG_CLIENT_TOKEN').default('').asString(),
    DATADOG_SITE: env.get('DATADOG_SITE').default('').asString(),
    DATADOG_SERVICE: env.get('DATADOG_SERVICE').default('').asString(),
  }) as ClientConfigInterface
})()
