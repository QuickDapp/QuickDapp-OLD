import { FC, PropsWithChildren, useEffect, useState } from "react"

/*
  This component prevents its children from rendering on the server, which can cause 
  hydration mismatches.
*/
export const ClientOnly: FC<PropsWithChildren> = ({ children }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? children : null
}

