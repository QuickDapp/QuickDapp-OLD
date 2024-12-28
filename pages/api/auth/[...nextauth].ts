/* Taken from: https://docs.login.xyz/integrations/nextauth.js */

import { SiweMessage } from 'siwe'
import NextAuth, { AuthOptions } from 'next-auth'
import { serverConfig } from '../../../src/config/server'
import { bootstrap } from '../../../src/backend/bootstrap'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createUserIfNotExists } from '../../../src/backend/db/users'


const app = bootstrap({ processName: 'nextauth-api' })

process.env.NEXTAUTH_URL = serverConfig.NEXTAUTH_URL

const providers = [
  CredentialsProvider({
    name: 'Ethereum',
    credentials: {
      message: {
        label: 'Message',
        type: 'text',
        placeholder: '0x0',
      },
      signature: {
        label: 'Signature',
        type: 'text',
        placeholder: '0x0',
      },
    },
    async authorize(credentials) {
      return await app.startSpan('authorize', async () => {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'))
          const nextAuthUrl = new URL(serverConfig.NEXT_PUBLIC_BASE_URL)
  
          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: nextAuthUrl.host,
            nonce: (credentials as any)?.csrfToken || '',
          })
  
          if (result.success) {
            // create a user entry if it doesn't already exist
            await createUserIfNotExists(app, siwe.address)
  
            return {
              id: siwe.address,
            }
          }
          return null
        } catch (e) {
          return null
        }
      })
    },
  }),
]

export const authOptions: AuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  secret: serverConfig.SESSION_ENCRYPTION_KEY,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub
      session.user.name = token.sub
      session.user.image = 'https://www.fillmurray.com/128/128'
      return session
    },
  },
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: any, res: any) {
  process.env.NEXTAUTH_URL = serverConfig.NEXTAUTH_URL

  const isDefaultSigninPage = req.method === 'GET' && req.query.nextauth.includes('signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await NextAuth(req, res, authOptions)
}
