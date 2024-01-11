'use client'

import '@rainbow-me/rainbowkit/styles.css'

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import {
  GetSiweMessageOptions,
  RainbowKitSiweNextAuthProvider,
} from '@rainbow-me/rainbowkit-siwe-next-auth'
import { SessionProvider } from 'next-auth/react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import * as wagmiChains from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { clientConfig } from '@/config/client'
import { CookieConsentBanner } from '@/frontend/components/CookieConsentBanner'
import { Header } from '@/frontend/components/Header'
import { CookieConsentProvider, GlobalProvider } from '@/frontend/contexts'
import { initDataDogAnalytics } from '@/frontend/utils/datadog'
import { APP_NAME } from '@/shared/constants'
import { FC, PropsWithChildren } from 'react'

initDataDogAnalytics()

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: `Sign in to ${APP_NAME}`,
})

const chain = (wagmiChains as any)[clientConfig.CHAIN]

const { chains, publicClient } = configureChains(
  [chain],
  [
    jsonRpcProvider({ rpc: () => ({ http: clientConfig.CHAIN_RPC_ENDPOINT }) }),
  ]
)

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  projectId: clientConfig.WALLETCONNECT_PROJECT_ID,
  chains
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export const WagmiLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider refetchInterval={0}>
        <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
          <RainbowKitProvider chains={chains} theme={darkTheme()} initialChain={chain}>
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
      </SessionProvider>
    </WagmiConfig>
  )
}



