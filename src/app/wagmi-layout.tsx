'use client'

import '@rainbow-me/rainbowkit/styles.css'

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit'
import {
  GetSiweMessageOptions,
  RainbowKitSiweNextAuthProvider,
} from '@rainbow-me/rainbowkit-siwe-next-auth'
import { SessionProvider } from 'next-auth/react'
import { WagmiProvider, http } from 'wagmi'
import * as wagmiChains from 'wagmi/chains'

import { clientConfig } from '@/config/client'
import { CookieConsentBanner } from '@/frontend/components/CookieConsentBanner'
import { Header } from '@/frontend/components/Header'
import { CookieConsentProvider, GlobalProvider } from '@/frontend/contexts'
import { initDataDogAnalytics } from '@/frontend/utils/datadog'
import { APP_NAME } from '@/shared/constants'
import { FC, PropsWithChildren } from 'react'
import { Disclaimer } from '@/frontend/components/ConnectWallet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

initDataDogAnalytics()

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: `Sign in to ${APP_NAME}`,
})

const chain = (wagmiChains as any)[clientConfig.NEXT_PUBLIC_CHAIN]

const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: clientConfig.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [chain],
  transports: {
    [chain.id]: http(clientConfig.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export const WagmiLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <SessionProvider refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
            <RainbowKitProvider
              theme={darkTheme()}
              initialChain={chain}
              appInfo={{
                appName: APP_NAME,
                disclaimer: Disclaimer,
              }}
            >
              <GlobalProvider>
                <CookieConsentProvider>
                  <div className="flex flex-col w-full min-h-screen relative">
                    <Header className="fixed h-header" />
                    <main className="relative m-after_header">
                      {children}
                    </main>
                    <footer>
                      <p className="text-xs p-4">Built with <a href="https://quickdapp.xyz">QuickDapp</a></p>
                    </footer>
                    <CookieConsentBanner />
                  </div>
                </CookieConsentProvider>
              </GlobalProvider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  )
}



