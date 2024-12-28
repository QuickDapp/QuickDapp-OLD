import { PrismaClient } from "@prisma/client"
import { PageParam } from "@/shared/graphql/generated/types"
import * as Sentry from '@sentry/nextjs'

export const getUnreadNotificationsCountForUser = async (db: PrismaClient, userId: number) => {
  return await Sentry.startSpan({ name: 'db.getUnreadNotificationsCountForUser' }, async () => {
    return db.notification.count({
      where: {
        userId,
        read: false,
      },
    })
  })
}

export const getNotificationsForUser = async (db: PrismaClient, userId: number, pageParams: PageParam) => {
  return await Sentry.startSpan({ name: 'db.getNotificationsForUser' }, async () => {
    return db.$transaction([
      db.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: pageParams.startIndex,
        take: pageParams.perPage,
      }),
      db.notification.count({
        where: {
          userId,
        },
      }),
    ])
  })
}

export const createNotification = async (db: PrismaClient, userId: number, data: object) => {
  return await Sentry.startSpan({ name: 'db.createNotification' }, async () => {
    return db.notification.create({
      data: {
        userId,
        data,
      },
    })
  })
}

export const markNotificationAsRead = async (db: PrismaClient, userId: number, id: number) => {
  return await Sentry.startSpan({ name: 'db.markNotificationAsRead' }, async () => {
    return db.notification.update({
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

export const markAllNotificationsAsRead = async (db: PrismaClient, userId: number) => {
  return await Sentry.startSpan({ name: 'db.markAllNotificationsAsRead' }, async () => {
    return db.notification.updateMany({
      where: {
        userId,
      },
      data: {
        read: true,
      },
    })
  })
}
