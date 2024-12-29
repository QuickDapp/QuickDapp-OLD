  import { serverConfig } from "@/config/server";
import NextAuth, { NextAuthConfig,  } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { SiweMessage } from "siwe";

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
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message as string || "{}")
          );

          const nextAuthUrl = serverConfig.NEXT_PUBLIC_BASE_URL;
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
          await siwe.verify({
            signature: credentials?.signature as string || "",
            domain: nextAuthHost,
            nonce: (credentials as any)?.csrfToken || "",
          });

          // console.log("siwe.address", siwe.address);
          return {
            id: siwe.address,
          };
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
      session.address = token.sub;
      session.user = {
        name: token.sub,
      };
      return session;
    },
  },
};

const { handlers, auth } = NextAuth(authOptions);

export { handlers, auth };
