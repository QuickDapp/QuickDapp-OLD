import { graphql } from "./generated/gql";

export const getMyNotificationsQuery = graphql(`
  query getMyNotifications($pageParam: PageParam!) {
    result: getMyNotifications(pageParam: $pageParam) {
      ...MyNotificationsFragment
    }
  }
`)

export const getMyUnreadNotificationsCountQuery = graphql(`
  query getMyUnreadNotificationsCount {
    result: getMyUnreadNotificationsCount
  }
`)
