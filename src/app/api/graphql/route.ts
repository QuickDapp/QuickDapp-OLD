import * as Sentry from "@sentry/nextjs";
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { ApolloServer, HeaderMap } from '@apollo/server'
import { auth } from '@/auth'
import { bootstrap } from '../../../backend/bootstrap'
import { ErrorCode, throwError } from '../../../shared/errors'
import { schema } from '../../../shared/graphql/schema'
import { createResolvers } from '../../../backend/graphql/resolvers'
import { directives } from '../../../shared/graphql/generated/directives'

const app = bootstrap({ processName: 'graphql-api' })

const server = new ApolloServer({
  csrfPrevention: true,
  resolvers: createResolvers(app),
  typeDefs: schema,
})

server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests()

export async function POST(request: NextRequest) {
  return await app.startSpan('graphql', async (span) => {
    const headersList = await headers()
    const graphqlHeaders = new HeaderMap()
  
    headersList.forEach((value: string, key: string) => {
      graphqlHeaders.set(key, value)
    })
  
    const body = await request.json()
    const searchParams = request.nextUrl.search

    span.setAttribute('gql.operation', body.operationName)

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      context: async () => {
        let ctx: any = {}
  
        // decode logged-in user
        const session = await auth()
        if (session?.user) {
          // set on tracing
          Sentry.setUser({
            id: session.user.id,
            username: session.user.name!,
          })
  
          ctx = {
            user: session.user,
          }
        }
  
        // route is authenticated?
        if (directives.auth.includes(body.operationName)) {
          span.setAttribute('gql.authenticated', true)

          if (!ctx.user) {
            throwError('Not authenticated', ErrorCode.UNAUTHORIZED)
          }
        }
  
        return ctx
      },
      httpGraphQLRequest: {
        body,
        headers: graphqlHeaders,
        method: 'POST',
        search: searchParams || '',
      },
    })
  
    // flush logs
    await app.log.flush()
  
    const responseHeaders = new Headers()
    for (const [key, value] of httpGraphQLResponse.headers) {
      responseHeaders.set(key, value)
    }
  
    if (httpGraphQLResponse.body.kind === 'complete') {
      return new Response(httpGraphQLResponse.body.string, {
        status: httpGraphQLResponse.status || 200,
        headers: responseHeaders,
      })
    } else {
      const chunks = []
      for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
        chunks.push(chunk)
      }
      return new Response(chunks.join(''), {
        status: httpGraphQLResponse.status || 200,
        headers: responseHeaders,
      })
    }
  })
}