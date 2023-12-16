---
order: 70
---

# Database

QuickDapp supports [PostgreSQL](https://www.postgresql.org/) databases by default, with [Prisma](https://www.prisma.io/) as the ORM layer. 

Technically speaking, any database type supported by Prisma could be used, although note that some of the DigitalOcean database-related commands (e.g [do-cloud](../command-line/do-cloud.md)) will then require modification.

## Connection parameters

The database connection parameters are supplied as the `DATABASE_URL` [environment variable](../environment-variables.md), e.g:

```ini
DATABASE_URL=postgresql://postgres:@localhost:5432/quickdapp?schema=public
```

## Schema

A number of [built-in tables](https://github.com/QuickDapp/QuickDapp/tree/master/src/backend/prisma/schema.prisma) are provided for your convenince:

* `Setting` - for any persisted app-level settings as key-value pairs.
* `User` - for authenticated users - includes a field for storing the user's `wallet` address and any `settings` field which can hold any JSON data.
* `Notification` - for [notifying](../users/notifications.md) users with a message or other data.
* `WorkerJob` - for the [background worker](../worker/index.md) task queue.

## Accessing

All database tables are accessed through purpose-built model code found in `src/backend/db`. This provides for an abstraction layer over the database which hids the raw Prisma commands from other backend code. Each model function excpets a `db` parameter which can be obtained from the [bootstrap object](./bootstrapped.md).

## Local development

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

## Production deployment

For the production database only a migration/upgrade ability is provided. 

To migrate the database to the latest schema:

```shell
pnpm prod db migrate
```






