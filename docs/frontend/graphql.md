---
order: 99
---

# GraphQL queries

All API requests made to the backend are done as GraphQL requests. 

[React query](https://tanstack.com/query/latest) is used to actually execute queries and handle pagination, optimistic updates, etc. The [`src/frontend/hooks/api.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/hooks/api.ts) file contains wrapper hooks for queries/mutations that need to be made in the dapp. It is recommended that you stick to this convention when adding new queries.

The [`src/shared/graphql/schema.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/graphql/schema.ts) file contains _all_ the queries and mutations available. Adding a new query or mutation involves the following:

1. Update [`schema.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/graphql/schema.ts).
1. Update one or more of [`fragments.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/graphql/fragments.ts), [`queries.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/graphql/queries.ts), [`mutations.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/graphql/mutations.ts).
1. Update the backend [`resolvers.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/backend/graphql/resolvers.ts) to ensure the query gets handled in the backend.


_Note: When running the dapp in [dev](../command-line/dev.md) mode there is a code generator which watches for changes to `schema.ts`, generating updated Typescript bindings on-the-fly. It's these bindings that are then used within the backend resolvers._

## Test GUI

When the dev server is run, accessing the `/api/graphql` path in the browser will bring up the [Apollo Sandbox](https://www.apollographql.com/docs/graphos/explorer/sandbox). Through this GUI you can enumerate and test all the GraphQL schema definitions, including queries and mutations.

## Authenticated queries

It's useful to be able to have certain queries and mutations only be callable by [authenticated users](../users/index.md). This is easily accomplished through the use of the `@auth` directive in the schema definition:

Example:

```graphql
type Query {
  # this query will fail if the user isn't authenticated
  getMyNotifications(pageParam: PageParam!): MyNotifications! @auth
  # this query will work for all users, even unauthenticated ones
  getLatestNews(): [NewsItem]!
}
```

If the user isn't authenticated (i.e. logged in) then the above `getMyNotifications` query will fail.

Authenticated queries/mutations automatically have a variable set within their corresponding backend resolver contexts, e.g:

```ts
return {
  Query: {
    getMyNotifications: async (_, { pageParam }, ctx: Context) => {
      console.log(ctx.user!.name) // wallet address
    }
  }
}
```


