import { useMutation } from "wagmi"
import { request } from "graphql-request"
import { MyNotifications, PageParam } from "@/shared/graphql/generated/types"
import { GetMyNotificationsQuery, Notification } from "@/shared/graphql/generated/graphql"
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMyNotificationsQuery, getMyUnreadNotificationsCountQuery } from "@/shared/graphql/queries"
import { markAllNotificationsAsReadMutation, markNotificationAsReadMutation } from "@/shared/graphql/mutations"

export const graphqlApiEndpoint = `/api/graphql`

export enum QueryKeys {
  GetMyTransactions = 'GetMyTransactions',
  GetMyNotifications = 'GetMyNotifications',
  GetMyUnreadNotificationsCount = 'GetMyUnreadNotificationsCount',
}

export const useGetMyUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: [QueryKeys.GetMyUnreadNotificationsCount],
    queryFn: async () => {
      return request(graphqlApiEndpoint, getMyUnreadNotificationsCountQuery)
    },
    select: (data) => {
      return data.result as number
    },
  })
}

export const useMyNotifications = (initialPageParam: PageParam) => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.GetMyNotifications],
    queryFn: async ({ pageParam }) => {
      return request(graphqlApiEndpoint, getMyNotificationsQuery, { pageParam })
    },
    initialPageParam,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const r = lastPage.result as MyNotifications

      // if last fetch fetched upto the total then nothing more to get
      if (lastPageParam.startIndex + lastPageParam.perPage >= r.total) {
        return undefined
      } else {
        return {
          startIndex: ~~Math.min(r.startIndex + lastPageParam.perPage, r.total - 1),
          perPage: lastPageParam.perPage,
        }
      }
    },
    getPreviousPageParam: (__, ___, nextPageParam) => {
      // if nothing more to fetch
      if (nextPageParam.startIndex === 0) {
        return undefined
      } else {
        return {
          startIndex: nextPageParam.startIndex - nextPageParam.perPage,
          perPage: nextPageParam.perPage,
        }
      }
    },
    select: (data) => {
      return data.pages.flatMap((p: any) => p.result.notifications) as Notification[]
    },
  })  
}


export const useMarkNotificationAsRead = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return request(graphqlApiEndpoint, markNotificationAsReadMutation, { id })
    },
    onMutate: async () => {
      // Snapshot the previous value
      const oldData = queryClient.getQueryData([QueryKeys.GetMyNotifications]) as InfiniteData<GetMyNotificationsQuery>

      // optimistically update the query data for this specific notification
      const newData = JSON.parse(JSON.stringify(oldData)) as InfiniteData<GetMyNotificationsQuery>
      newData.pages.forEach(p => {
        const r = p.result as MyNotifications
        r.notifications.forEach(n => {
          if (n!.id === id) {
            n!.read = true
          }
        })
      })

      queryClient.setQueryData([QueryKeys.GetMyNotifications], () => newData)

      // Return a context object with the snapshotted value
      return { oldData }
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (___, __, context) => {
      console.error(`Rolling back optimistic update`)
      queryClient.setQueryData([QueryKeys.GetMyNotifications], context?.oldData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GetMyUnreadNotificationsCount] })
    }
  })
}


export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return request(graphqlApiEndpoint, markAllNotificationsAsReadMutation)
    },
    onMutate: async () => {
      // Snapshot the previous value
      const oldData = queryClient.getQueryData([QueryKeys.GetMyNotifications]) as InfiniteData<GetMyNotificationsQuery>

      // optimistically update the query data for this specific notification
      const newData = JSON.parse(JSON.stringify(oldData)) as InfiniteData<GetMyNotificationsQuery>
      newData.pages.forEach(p => {
        const r = p.result as MyNotifications
        r.notifications.forEach(n => {
          n!.read = true
        })
      })

      queryClient.setQueryData([QueryKeys.GetMyNotifications], () => newData)

      // Return a context object with the snapshotted value
      return { oldData }
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (___, __, context) => {
      console.error(`Rolling back optimistic update`)
      queryClient.setQueryData([QueryKeys.GetMyNotifications], context?.oldData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GetMyUnreadNotificationsCount] })
    },
  })
}


