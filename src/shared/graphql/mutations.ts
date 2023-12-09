import { graphql } from './generated/gql'

export const markNotificationAsReadMutation = graphql(`
  mutation markNotificationAsRead($id: PositiveInt!) {
    result: markNotificationAsRead(id: $id) {
      ...SuccessFragment
    }
  }
`)

export const markAllNotificationsAsReadMutation = graphql(`
  mutation markAllNotificationsAsRead {
    result: markAllNotificationsAsRead {
      ...SuccessFragment
    }
  }
`)

export const generateAblyTokenMutation = graphql(`
  mutation generateAblyToken {
    result: generateAblyToken
  }
`)