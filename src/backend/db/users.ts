import { PrismaClient } from "@prisma/client"
import * as Sentry from '@sentry/nextjs'

export const createUserIfNotExists = async (db: PrismaClient, wallet: string) => {
  return await Sentry.startSpan({ name: 'db.createUserIfNotExists' }, async () => {
    return db.$transaction(async tx => {
      let u = await tx.user.findFirst({
        where: {
          wallet: wallet.toLowerCase(),
        },
      })

      if (!u) {
        u = await tx.user.create({
          data: {
            wallet: wallet.toLowerCase(),
          },
        })
      }

      return u
    })
  })
}

export interface User {
  id: number
  wallet: string
}

export const getUser = async (db: PrismaClient, wallet: string): Promise<User | undefined> => {
  return await Sentry.startSpan({ name: 'db.getUser' }, async () => {
    const ret = await db.user.findFirst({
      where: {
        wallet: wallet.toLowerCase(),
      },
    })

    return ret ? ret : undefined
  })
}
