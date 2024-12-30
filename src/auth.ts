import * as Sentry from "@sentry/nextjs";
import { serverConfig } from "@/config/server";
import NextAuth, { NextAuthConfig,  } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { bootstrap } from "./backend/bootstrap";
import { createUserIfNotExists } from "./backend/db";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          placeholder: "0x0",
          type: "text",
        },
        signature: {
          label: "Signature",
          placeholder: "0x0",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        // console.log("credentials", credentials);
        try {
          const siwe = new SiweMessage(credentials?.message as string)

          const nextAuthUrl = serverConfig.NEXTAUTH_URL || serverConfig.NEXT_PUBLIC_BASE_URL;
          // console.log("nextAuthUrl", nextAuthUrl);
          if (!nextAuthUrl) {
            return null;
          }

          const nextAuthHost = new URL(nextAuthUrl).host;
          // console.log("nextAuthHost", nextAuthHost);
          if (siwe.domain !== nextAuthHost) {
            return null;
          }

          // TODO: check siwe.nonce against csrfToken
          // https://github.com/nextauthjs/next-auth/discussions/7256

          // console.log('verifying...')
          const result = await siwe.verify({
            signature: credentials?.signature as string || "",
            domain: nextAuthHost,
            nonce: (credentials as any)?.csrfToken || "",
          });

          // console.log(`result: ${result}`)
          if (result.success) {
            const app = bootstrap({ processName: 'auth' })

            // create a user entry if it doesn't already exist
            const u = await createUserIfNotExists(app, siwe.address)
  
            // set on tracing
            Sentry.setUser({
              id: u.id,
              username: u.wallet,
            })

            return {
              id: u.wallet
            }
          } else {
            return null
          }        
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },

  debug: serverConfig.NEXT_PUBLIC_APP_MODE === "development",

  secret: serverConfig.SESSION_ENCRYPTION_KEY,

  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub
      session.user.name = token.sub
      session.user.image = 'https://www.fillmurray.com/128/128'
      return session;
    },
  },
};

const { handlers, auth } = NextAuth(authOptions);

export { handlers, auth };
