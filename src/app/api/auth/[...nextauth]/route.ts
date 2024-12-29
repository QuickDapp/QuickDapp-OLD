import { serverConfig } from "@/config/server";
import { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

export const authOptions: AuthOptions = {
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
            JSON.parse(credentials?.message || "{}")
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

          // console.log("siwe.nonce", siwe.nonce);
          if (
            siwe.nonce !==
            (await getCsrfToken({ req: { headers: req.headers } }))
          ) {
            return null;
          }
          
          // console.log('verifying...')
          await siwe.verify({
            signature: credentials?.signature || "",
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };