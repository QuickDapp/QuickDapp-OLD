import { PrismaClient } from "@prisma/client"
import { BootstrappedApp } from "../bootstrap"

export const createUserIfNotExists = async (app: BootstrappedApp, wallet: string) => {
  return await app.startSpan('db.createUserIfNotExists', async () => {
    return app.db.$transaction(async tx => {
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

export const getUser = async (app: BootstrappedApp, wallet: string): Promise<User | undefined> => {
  return await app.startSpan('db.getUser', async () => {
    const ret = await app.db.user.findFirst({
      where: {
        wallet: wallet.toLowerCase(),
      },
    })

    return ret ? ret : undefined
  })
}
