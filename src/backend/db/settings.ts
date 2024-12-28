import { PrismaClient } from "@prisma/client"
import * as Sentry from '@sentry/nextjs'

export type SettingValueType = string | number | object

export const setValue = async (db: PrismaClient, key: string, value: SettingValueType) => {
  return await Sentry.startSpan({ name: 'db.setValue' }, async () => {
    value = JSON.stringify(value)

    return db.setting.upsert({
      where: {
        key,
      },
      create: {
        key,
        value,
      },
      update: {
        value,
        updatedAt: new Date(),
      },
    })
  })
}

export const getValue = async (db: PrismaClient, key: string): Promise<SettingValueType | null> => {
  return await Sentry.startSpan({ name: 'db.getValue' }, async () => {
    const r = await db.setting.findFirst({
      where: {
        key,
      },
    })

    return r ? JSON.parse(r.value) : null
  })
}
