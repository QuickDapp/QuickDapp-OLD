import { Comfortaa, Noto_Sans } from 'next/font/google'

import './globals.css'

import { Metadata } from 'next'
import { APP_NAME } from '@/shared/constants'
import { WagmiLayout } from './wagmi-layout'

const ComfortaaFont = Comfortaa({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-comfortaa',
})
const Noto_SansFont = Noto_Sans({
  subsets: ['latin'],
  weight: ['300', '700'],
  display: 'swap',
  variable: '--font-noto-sans',
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${ComfortaaFont.variable} ${Noto_SansFont.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1"
          />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000" />
      </head>
      <body className='font-body min-h-screen'>
        <WagmiLayout>
          {children}
        </WagmiLayout>
      </body>
    </html>
  )
}

export const metadata = {
  description: "QuickDapp is a starter kit for building dapps on Ethereum.",
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
} satisfies Metadata
