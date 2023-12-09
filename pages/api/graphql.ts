import get from 'lodash.get'
import { parse } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApolloServer, HeaderMap } from '@apollo/server'

import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { bootstrap } from '../../src/backend/bootstrap'
import { ErrorCode, throwError } from '../../src/shared/errors'
import { schema } from '../../src/shared/graphql/schema'
import { createResolvers } from '../../src/backend/graphql/resolvers'
import { directives } from '../../src/shared/graphql/generated/directives' 

//
// Code below based on: https://github.com/apollo-server-integrations/apollo-server-integration-next/blob/0df99b74eece9cdba368920b49549855ebb27c1b/src/startServerAndCreateNextHandler.ts
//

const app = bootstrap({ processName: 'graphql-api' })

const server = new ApolloServer({
  csrfPrevention: true,
  resolvers: createResolvers(app),
  typeDefs: schema,
})

server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = new HeaderMap()

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value)
    }
  }

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    context: async () => {
      let ctx: any = {}

      // decode logged-in user
      const session = await getServerSession(req, res, authOptions)
      if (session && get(session, 'user')) {
        ctx = {
          user: session.user,
        }
      }

      // route is authenticated?
      if (directives.auth.includes(req.body.operationName) && !ctx.user) {
        throwError('Not authenticated', ErrorCode.UNAUTHORIZED)
      }

      return ctx
    },
    httpGraphQLRequest: {
      body: req.body,
      headers,
      method: req.method || 'POST',
      search: req.url ? parse(req.url).search || '' : '',
    },
  })

  // flush logs
  await app.log.flush()

  /* @ts-ignore */
  for (const [key, value] of httpGraphQLResponse.headers) {
    res.setHeader(key, value)
  }

  res.statusCode = httpGraphQLResponse.status || 200

  if (httpGraphQLResponse.body.kind === 'complete') {
    res.send(httpGraphQLResponse.body.string)
  } else {
    for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
      res.write(chunk)
    }

    res.end()
  }
}
