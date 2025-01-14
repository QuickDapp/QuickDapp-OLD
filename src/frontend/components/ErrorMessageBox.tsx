import { FC, PropsWithChildren } from "react"
import { PropsWithClassName, cn } from "../utils"

export const ErrorMessageBox: FC<PropsWithChildren<PropsWithClassName>> = ({
  className,
  children,
}) => {
  return (
    <div className={cn("bg-red-300 text-black p-4 rounded-md", className)}>
      {children}
    </div>
  )
}
