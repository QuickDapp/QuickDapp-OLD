"use client"

import { useGetMyUnreadNotificationsCount, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useMyNotifications } from "@/frontend/hooks";
import { dateFriendlyFormat } from "@/shared/date";
import { Notification } from "@/shared/graphql/generated/graphql";
import { FC, PropsWithChildren, useCallback, useMemo } from "react";
import { cn } from "../utils";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";
import { ErrorMessageBox } from "./ErrorMessageBox";
import { Bell } from "./Icons";
import { Loading } from "./Loading";
import { OnceVisibleInViewport } from './OnceVisibleInViewport';
import { PingAnimation } from "./PingAnimation";
import { usePubSub } from "../hooks/pubsub";
import { PubSubMessageType } from "@/shared/pubsub";

const Item: FC<{ data: Notification }> = ({ data }) => {
  const read = useMemo(() => data.read, [data.read])  

  const markAsRead = useMarkNotificationAsRead(data.id)

  const onClick = useCallback(() => {
    if (!read) {
      markAsRead.mutate()
    }
  }, [read, markAsRead])

  return (
    <div onClick={onClick} className={cn(
      "w-full rounded-md bg-slate-500 relative",
      {
        "bg-slate-700": read,
        "text-sm": read,
        "cursor-pointer hover:outline hover:outline-1 hover:outline-slate-50": !read,
      }
    )}>
      {read ? null : <PingAnimation className="absolute top-0 right-0" />}
      <div className="p-4 flex flex-row justify-between items-start">
        <div className={cn("text-white", {
          "text-slate-400": read,
        })}>
          {data.data.msg}
        </div>
        <div className={cn("text-right ml-4 w-20 text-gray-400", {
          "text-slate-500": read,
        })}>
          {dateFriendlyFormat(data.createdAt)}
        </div>
      </div>
    </div>
  )
}


const List: FC<{ data: Notification[] }> = ({ data }) => {
  return (
    <ul className="divide-y divide-slate-900">
      {data.map((n) => {
        return (
          <li className="py-2" key={n.id}>
            <Item data={n} />
          </li>
        )
      })}
    </ul>
  )
} 


export const NotificationsDialog: FC<PropsWithChildren<{}>> = ({ children }) => {
  const notifications = useMyNotifications({
    startIndex: 0,
    perPage: 10,
  })

  usePubSub((msg) => {
    if (msg.type === PubSubMessageType.NEW_NOTIFICATIONS) {
      notifications.refetch()
    }
  }, [notifications])

  const onReachedBottomOfList = useCallback((visible: boolean) => {
    if (visible && notifications.hasNextPage && !notifications.isFetching) {
      notifications.fetchNextPage()
    }
  }, [notifications])

  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead()

  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead.mutate()
  }, [markAllNotificationsAsRead])

  return (
    <Dialog>
      <DialogTrigger aria-label="notifications">
        {children}
      </DialogTrigger>
      <DialogContent className="h-[80vh]" size='med'>
        <DialogHeader>
          <DialogTitle className="font-heading mb-2">
            Notifications <Button size='xs' className="ml-4" onClick={markAllAsRead}>Mark all as read</Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-8 mb-4">
          {notifications.data ? (
            <List data={notifications.data} />            
            ) : null}
        </div>
        {notifications.isFetching ? <Loading className="mt-4" /> : null}
        {notifications.error ? <ErrorMessageBox className="mt-4">{`${notifications.error}`}</ErrorMessageBox> : null}
        <OnceVisibleInViewport onVisibilityChanged={onReachedBottomOfList} />
      </DialogContent>
    </Dialog>				
  )
}


export const NotificationsIndicator: FC<{}> = () => {
  const unreadNotifications = useGetMyUnreadNotificationsCount()

  usePubSub((msg) => {
    if (msg.type === PubSubMessageType.NEW_NOTIFICATIONS) {
      unreadNotifications.refetch()
    }
  }, [unreadNotifications])

  return (
    <NotificationsDialog>
      <div className="relative">
        {unreadNotifications.data ? <PingAnimation className="absolute top-0 right-0" /> : null}
        <Bell size={24} />
      </div>
    </NotificationsDialog>
  )
}