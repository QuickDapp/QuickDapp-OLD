"use client"

import { FC, PropsWithChildren, ReactNode } from "react"
import { useGlobalContext } from "../contexts"
import { ConnectWallet } from "./ConnectWallet"

/*
  This component prevents its children from rendering if the user's wallet is not connected.
*/
export const IfWalletConnected: FC<
  PropsWithChildren<{ connectButton?: ReactNode }>
> = ({ children, connectButton = <ConnectWallet /> }) => {
  const { wallet } = useGlobalContext()

  return wallet?.isAuthenticated ? children : connectButton
}
