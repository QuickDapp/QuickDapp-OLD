import { PrismaClient } from "@prisma/client"
import { PageParam } from "@/shared/graphql/generated/types"

export const getUnreadNotificationsCountForUser = async (db: PrismaClient, userId: number) => {
  return db.notification.count({
    where: {
      userId,
      read: false,
    },
  })
}

export const getNotificationsForUser = async (db: PrismaClient, userId: number, pageParams: PageParam) => {
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
}

export const createNotification = async (db: PrismaClient, userId: number, data: object) => {
  return db.notification.create({
    data: {
      userId,
      data,
    },
  })
}

export const markNotificationAsRead = async (db: PrismaClient, userId: number, id: number) => {
  return db.notification.update({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
    },
  })
}

export const markAllNotificationsAsRead = async (db: PrismaClient, userId: number) => {
  return db.notification.updateMany({
    where: {
      userId,
    },
    data: {
      read: true,
    },
  })
}
