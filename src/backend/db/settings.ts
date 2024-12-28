import { PrismaClient } from "@prisma/client"
import { BootstrappedApp } from "../bootstrap"

export type SettingValueType = string | number | object

export const setValue = async (app: BootstrappedApp, key: string, value: SettingValueType) => {
  return await app.startSpan('db.setValue', async () => {
    value = JSON.stringify(value)

    return app.db.setting.upsert({
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

export const getValue = async (app: BootstrappedApp, key: string): Promise<SettingValueType | null> => {
  return await app.startSpan('db.getValue', async () => {
    const r = await app.db.setting.findFirst({
      where: {
        key,
      },
    })

    return r ? JSON.parse(r.value) : null
  })
}
