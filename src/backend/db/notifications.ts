import { PrismaClient } from "@prisma/client"
import { PageParam } from "@/shared/graphql/generated/types"
import { BootstrappedApp } from "../bootstrap"

export const getUnreadNotificationsCountForUser = async (app: BootstrappedApp, userId: number) => {
  return await app.startSpan('db.getUnreadNotificationsCountForUser', async () => {
    return app.db.notification.count({
      where: {
        userId,
        read: false,
      },
    })
  })
}

export const getNotificationsForUser = async (app: BootstrappedApp, userId: number, pageParams: PageParam) => {
  return await app.startSpan('db.getNotificationsForUser', async () => {
    return app.db.$transaction([
      app.db.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: pageParams.startIndex,
        take: pageParams.perPage,
      }),
      app.db.notification.count({
        where: {
          userId,
        },
      }),
    ])
  })
}

export const createNotification = async (app: BootstrappedApp, userId: number, data: object) => {
  return await app.startSpan('db.createNotification', async () => {
    return app.db.notification.create({
      data: {
        userId,
        data,
      },
    })
  })
}

export const markNotificationAsRead = async (app: BootstrappedApp, userId: number, id: number) => {
  return await app.startSpan('db.markNotificationAsRead', async () => {
    return app.db.notification.update({
      where: {
        id,
        userId,
      },
      data: {
        read: true,
      },
    })
  })
}

export const markAllNotificationsAsRead = async (app: BootstrappedApp, userId: number) => {
  return await app.startSpan('db.markAllNotificationsAsRead', async () => {
    return app.db.notification.updateMany({
      where: {
        userId,
      },
      data: {
        read: true,
      },
    })
  })
}
