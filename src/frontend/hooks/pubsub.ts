import { PubSubMessage } from "@/shared/pubsub";
import { useWindowEvent } from "@better-hooks/window";

export const usePubSub = (cb: (msg: PubSubMessage) => void, deps: any[]) => {
  return useWindowEvent("message", (event: MessageEvent) => {
    if (event.data && typeof event.data.type == 'string') {
      cb(event.data as PubSubMessage)
    }
  }, deps)
}
