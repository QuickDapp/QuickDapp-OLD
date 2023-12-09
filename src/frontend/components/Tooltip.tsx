import { FC, PropsWithChildren, ReactNode } from "react"
import { cn } from "@/frontend/utils"
import { Info } from './Icons'
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"

export const Tooltip: FC<PropsWithChildren<{ className?: string, style?: any, triggerContent?: ReactNode }>> = ({ className, style, children, triggerContent }) => {
  return (
    <span className={cn('inline-block text-anchor', className)} style={style}>
      <Popover>
        <PopoverTrigger>
          {triggerContent || (
            <span className="svg-inline">
              <Info className="w-4 h-4" />
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent>{children}</PopoverContent>
      </Popover>
    </span>
  )
}

