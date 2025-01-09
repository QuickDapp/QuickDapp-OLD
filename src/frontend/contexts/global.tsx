"use client"

import { generateAblyTokenMutation } from '@/shared/graphql/mutations'
import Ably from 'ably'
import request from 'graphql-request'
import { useSession } from 'next-auth/react'
import React, { FC, useContext, useEffect, useMemo } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { graphqlApiEndpoint } from '../hooks'
import { truncateStr } from '../utils'
import { PubSubMessage } from '@/shared/pubsub'
import { WalletClient } from 'viem'

export interface Wallet {
  client: WalletClient
  isAuthenticated: boolean
  address: string
  addressTruncated: string
}

export interface GlobalContextValue {
  wallet?: Wallet
  ably?: Ably.Types.RealtimePromise
  chain: ReturnType<typeof useAccount>['chain']
}

export const GlobalContext = React.createContext({} as GlobalContextValue)

export const GlobalProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const [isAblyConnecting, setIsAblyConnecting] = React.useState<boolean>(false)
  const [ably, setAbly] = React.useState<Ably.Types.RealtimePromise>()
  const { chain, address } = useAccount()
  const { data: client } = useWalletClient()
  const session = useSession()

  const wallet = useMemo(() => {
    if (address && client) {
      return {
        client,
        isAuthenticated: session.status === 'authenticated',
        address: address,
        addressTruncated: truncateStr(address as string, 12),
      }
    }
    return undefined
  }, [address, client, session.status])

  useEffect(() => {
    if (wallet?.isAuthenticated) {
      if (!ably && !isAblyConnecting) {
        (async () => {
          try {
            setIsAblyConnecting(true)

            const a = new Ably.Realtime.Promise({
              authCallback: (_ignore, cb) => {
                request(graphqlApiEndpoint, generateAblyTokenMutation)
                  .then(data => {
                    if (data?.result) {
                      cb(null, data.result)
                    } else {
                      console.warn('No ably token returned')
                    }
                  })
                  .catch(err => {
                    console.error(err)
                    cb(err, null)
                  })
              }
            })

            a.connection.on('disconnected', () => {
              console.warn('Ably disconnected')
            })

            a.connection.on('failed', () => {
              console.warn('Ably failed')
            })

            await a.connection.once('connected')
            console.log('Ably connected')

            a.channels.get(wallet.address.toLowerCase()).subscribe('msg', ({ data } : { data: PubSubMessage }) => {
              window.postMessage(data, '*')
            })

            setAbly(a)
          } catch (e) {
            console.error(`Ably connection error`, e)
          } finally {
            setIsAblyConnecting(false)
          }
        })()
      }
    } else {
      if (ably) {
        ably.close()
        setAbly(undefined)
        setIsAblyConnecting(false)
      }
    }
  }, [wallet, ably, isAblyConnecting])

  return (
    <GlobalContext.Provider
        value={{
          wallet,
          ably,
          chain,
        }}
      >
        {children}
    </GlobalContext.Provider>
  )
}

export const GlobalConsumer = GlobalContext.Consumer

export const useGlobalContext = () => {
  return useContext(GlobalContext)
}
