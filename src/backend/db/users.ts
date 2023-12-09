import { PrismaClient } from "@prisma/client"

export const createUserIfNotExists = async (db: PrismaClient, wallet: string) => {
  return db.$transaction(async (tx) => {
    const u = await tx.user.findFirst({
      where: {
        wallet: wallet.toLowerCase(),
      },
    })

    if (!u) {
      await tx.user.create({
        data: {
          wallet: wallet.toLowerCase(),
        },
      })
    }
  })
}

export interface User {
  id: number
  wallet: string
}

export const getUser = async (db: PrismaClient, wallet: string): Promise<User | undefined> => {
  const ret = await db.user.findFirst({
    where: {
      wallet: wallet.toLowerCase(),
    },
  })

  return ret ? ret : undefined
}
