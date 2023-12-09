import { FC } from "react"
import { PropsWithClassName, cn } from "../utils"

export const PingAnimation: FC<PropsWithClassName> = ({ className }) => {
  return (
    <div className={cn("flex h-2 w-2", className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500"></span>
    </div>
  )
}

