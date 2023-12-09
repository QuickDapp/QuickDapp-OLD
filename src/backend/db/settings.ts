import { PrismaClient } from "@prisma/client"

export type SettingValueType = string | number | object

export const setValue = async (db: PrismaClient, key: string, value: SettingValueType) => {
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
}

export const getValue = async (db: PrismaClient, key: string): Promise<SettingValueType | null> => {
  const r = await db.setting.findFirst({
    where: {
      key,
    },
  })

  return r ? JSON.parse(r.value) : null
}
