import gql from 'graphql-tag'

export const schema = gql`
  directive @auth on FIELD_DEFINITION # for authenticated queries and mutations
  scalar DateTime
  scalar JSON
  scalar PositiveInt

  type ErrorDetails {
    code: String
    message: String!
  }

  type Error {
    error: ErrorDetails!
  }

  type Success {
    success: Boolean!
  }

  type Notification {
    id: PositiveInt!
    userId: PositiveInt!
    data: JSON!
    createdAt: DateTime!
    read: Boolean!
  }

  type MyNotifications {
    notifications: [Notification]!
    startIndex: Int!
    total: Int!
  }

  input PageParam {
    startIndex: Int!
    perPage: Int!
  }

  ################################################################################################################
  # NOTE: For untion types the code generator only supports two sub-types: Error and whatever the success type is
  ################################################################################################################
  # union MutationResult = Success | Error

  type Query {
    getMyNotifications(pageParam: PageParam!): MyNotifications! @auth
    getMyUnreadNotificationsCount: Int! @auth
  }

  type Mutation {
    generateAblyToken: JSON @auth
    markNotificationAsRead(id: PositiveInt!): Success! @auth
    markAllNotificationsAsRead: Success! @auth
  }
`



