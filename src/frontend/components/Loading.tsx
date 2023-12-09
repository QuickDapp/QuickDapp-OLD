import { FC } from "react"
import { PropsWithClassName, cn } from "@/frontend/utils"
import { Square } from './Icons'

export const Loading: FC<PropsWithClassName<{}>> = ({ className }) => {
  return (
    <span className={cn('select-none', className)}>
      <Square width='1em' height='1em'>
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="1s"
          from="0 0 0"
          to="360 0 0"
          repeatCount="indefinite"
        ></animateTransform>
      </Square>
    </span>
  )
}

