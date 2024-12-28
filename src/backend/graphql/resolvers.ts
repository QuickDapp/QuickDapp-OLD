import { getUser } from "../db/users"
import { DefaultSession } from "next-auth"
import { ONE_MINUTE } from "@/shared/date"
import { BootstrappedApp } from "../bootstrap"
import { Resolvers } from "@/shared/graphql/generated/types"
import { getNotificationsForUser, getUnreadNotificationsCountForUser, markAllNotificationsAsRead, markNotificationAsRead } from "../db"
import * as Sentry from '@sentry/nextjs'

interface Context {
  user?: DefaultSession['user']
}

export const createResolvers = (app: BootstrappedApp) => {
  const log = app.log.create('res')

  return {
    Query: {
      getMyUnreadNotificationsCount: async (_, __, ctx: Context) => {
        return await Sentry.startSpan({ name: 'resolver.getMyUnreadNotificationsCount' }, async () => {
          log.trace(`getMyUnreadNotificationsCount`)

          const user = await getUser(app.db, ctx.user!.name as string)

          if (!user) {
            return 0
          }

          return getUnreadNotificationsCountForUser(app.db, user!.id as number)
        })
      },
      getMyNotifications: async (_, { pageParam }, ctx: Context) => {
        return await Sentry.startSpan({ name: 'resolver.getMyNotifications' }, async () => {
          log.trace(`getMyNotifications`)

          const user = await getUser(app.db, ctx.user!.name as string)

          if (!user) {
            return {
              notifications: [],
              startIndex: 0,
              total: 0,
            }
          }

          const [notifications, total] = await getNotificationsForUser(app.db, user!.id as number, pageParam)

          return {
            notifications,
            startIndex: pageParam.startIndex,
            total,
          }
        })
      },
    },
    Mutation: {
      generateAblyToken: async (_, __, ctx: Context) => {
        return await Sentry.startSpan({ name: 'resolver.generateAblyToken' }, async () => {
          log.trace(`generateAblyToken`)

          const user = await getUser(app.db, ctx.user!.name as string)

          if (user) {
            if (app.ably) {
              const token = await new Promise((resolve, reject) => {
                app.ably!.auth.requestToken(
                  {
                    clientId: `${user.id}`,
                    ttl: 60 * ONE_MINUTE,
                  },
                  (err, token) => {
                    if (err) {
                      reject(err)
                    } else {
                      resolve(token)
                    }
                  }
                )
              })
              return token
            } else {
              log.warn(`Ably not configured`)
            }
          }

          return undefined
        })
      },
      markNotificationAsRead: async (_, { id }, ctx: Context) => {
        return await Sentry.startSpan({ name: 'resolver.markNotificationAsRead' }, async () => {
          log.trace(`markNotificationAsRead`)

          const user = await getUser(app.db, ctx.user!.name as string)

          await markNotificationAsRead(app.db, user!.id as number, id)

          return {
            success: true,
          }
        })
      },
      markAllNotificationsAsRead: async (_: any, __: any, ctx: Context) => {
        return await Sentry.startSpan({ name: 'resolver.markAllNotificationsAsRead' }, async () => {
          log.trace(`markAllNotificationsAsRead`)

          const user = await getUser(app.db, ctx.user!.name as string)

          await markAllNotificationsAsRead(app.db, user!.id as number)

          return {
            success: true,
          }
        })
      },
    },
  } as Resolvers
}
