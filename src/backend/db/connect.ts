import { PrismaClient } from '@prisma/client'
import { LogInterface } from '../logging'

import { ServerConfigInterface } from '../../config/server'

export interface ConnectDbConfig {
  log: LogInterface
  config: ServerConfigInterface
}

export const connectDb = ({ config, log }: ConnectDbConfig): PrismaClient => {
  const db = new PrismaClient({
    datasources: {
      db: {
        url: config.DATABASE_URL!,
      },
    },
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'query', emit: 'event' },
    ],
  })

  const _format = (e: any) => {
    return e.query
      ? {
          query: e.query,
          params: e.params,
        }
      : e
  }

  db.$on('error', e => {
    log.error(_format(e))
  })

  db.$on('warn', e => {
    log.warn(_format(e))
  })

  db.$on('info', e => {
    log.debug(_format(e))
  })

  db.$on('query', e => {
    log.trace(_format(e))
  })

  return db
}

/**
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/transactions#transaction-timing-issues
 */
export const retryTransaction = async (
  log: LogInterface,
  numRetries: number,
  fn: () => Promise<any>
): Promise<any> => {
  let retries = 0
  while (retries < numRetries) {
    try {
      return await fn()
    } catch (err: any) {
      if (err.code == 'P2034') {
        retries++
        log.warn(`Retrying transaction (${retries}/${numRetries})...`)
      } else {
        throw err
      }
    }
  }
}
