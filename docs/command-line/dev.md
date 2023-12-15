---
order: 100
---

# dev

The `dev` command is responsible for:

* Running the Next.js dev server.
* Running the [background worker](../background-worker/index.md) dev server.
* Running development database management commands.

All of these commands operate using the **development** environment configuration as defined via the [environment variables](../environment-variables.md).

## Next.js

```shell
pnpm dev web
```

This internally runs:

* Next.js dev server which watches for changes to your web app and reloads automatically.
* GraphQL code generator which auto-generates Typescript bindings when your GraphQL schema changes.

The website will be accessible at [http://localhost:3000](http://localhost:3000).

## Background worker

```shell
pnpm dev worker
```

This internally runs:

* Node.js process for the background worker which auto-restarts when changes are made to the worker code.
* Code generator which auto-generates Typescript exports when a background job is added or modified.

## Running servers simultaneously

To run both the the Next.js and background worker servers simultaneously:

```shell
pnpm dev
```

## Database management

To migrate the database to the latest schema:

```shell
pnpm dev db migrate
```

To reset the database to the latest schema and clear all of its data:

```shell
pnpm dev db reset
```

To re-generate the Prisma client and associated Typescript bindings:

```shell
pnpm dev db generate-types
```
