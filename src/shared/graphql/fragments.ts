import { graphql } from './generated/gql'

export const ErrorFragment = graphql(`
  fragment ErrorFragment on Error {
    error {
      code
      message
    }
  }
`)

export const SuccessFragment = graphql(`
  fragment SuccessFragment on Success {
    success
  }
`)

export const NotificationFragment = graphql(`
  fragment NotificationFragment on Notification {
    id
    userId
    data
    createdAt
    read
  }
`)

export const MyNotificationsFragment = graphql(`
  fragment MyNotificationsFragment on MyNotifications {
    notifications {
      ...NotificationFragment
    }
    startIndex
    total
  }
`)
