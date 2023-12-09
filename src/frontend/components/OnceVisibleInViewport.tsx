import { FC } from "react"
import { InView } from "react-intersection-observer"

export const OnceVisibleInViewport: FC<{ onVisibilityChanged: (visible: boolean) => void }> = ({ onVisibilityChanged }) => {
  return (
    <InView as="div" onChange={onVisibilityChanged}><div /></InView>
  )
}

