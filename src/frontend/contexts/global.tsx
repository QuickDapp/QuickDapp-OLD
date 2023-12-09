"use client"

import { generateAblyTokenMutation } from '@/shared/graphql/mutations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Ably from 'ably'
import request from 'graphql-request'
import { useSession } from 'next-auth/react'
import React, { FC, useContext, useEffect, useMemo } from 'react'
import { WalletClient, useAccount, useNetwork, useWalletClient } from 'wagmi'
import { graphqlApiEndpoint } from '../hooks'
import { truncateStr } from '../utils'
import { PubSubMessage } from '@/shared/pubsub'

const queryClient = new QueryClient()

export interface Wallet {
  isAuthenticated: boolean
  client: WalletClient
  address: string
  addressTruncated: string
}

export interface GlobalContextValue {
  wallet?: Wallet
  ably?: Ably.Types.RealtimePromise
  chain: ReturnType<typeof useNetwork>['chain']
}

export const GlobalContext = React.createContext({} as GlobalContextValue)

export const GlobalProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const [isAblyConnecting, setIsAblyConnecting] = React.useState<boolean>(false)
  const [ably, setAbly] = React.useState<Ably.Types.RealtimePromise>()
  const { chain } = useNetwork()
  const account = useAccount()
  const { data: client } = useWalletClient()
  const session = useSession()

  const wallet = useMemo(() => {
    if (account && account.address && client) {
      return {
        client,
        isAuthenticated: session.status === 'authenticated',
        address: account.address as string,
        addressTruncated: truncateStr(account.address as string, 12),
      }
    }
    return undefined
  }, [account, client, session.status])

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
        <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
    </GlobalContext.Provider>
  )
}

export const GlobalConsumer = GlobalContext.Consumer

export const useGlobalContext = () => {
  return useContext(GlobalContext)
}
