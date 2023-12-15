---
order: 97
---

# Environment variables

Environment variables are the primary means through which to pass configuration to your app at both build-time and runtime. 

QuickDapp follows the [Next.js conventions](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables) when it comes to specifying environment variables for your app.

The [dotenv](https://www.npmjs.com/package/dotenv) loads environement varibles from various `.env*` files in the project root folder whilst still allowing for overrides specified directly via the shell/terminal environment itself.

Environment variables are loaded in order from the following places, with later places taking precendence over earlier ones:

1. `.env`
2. `.env.development` or `.env.production`, depending on the value of the `NODE_ENV` environment variable.
3. `.env.local`
4. Shell/terminal environment

What this means is that if the same environment variable is declared in multiple places then its final value during runtime is determined by the above order.

**Example**

Let's assume that:

* `.env` contains `APP_NAME=root`
* `.env.development` contains `APP_NAME=dev`
* `.env.production` contains `APP_NAME=prod`
* `.env.local` contains `APP_NAME=local`

When the dev server is run, at runtime the `process.env.APP_NAME` value will equal `local`. If we delete the `.env.local` file and restart the server then the runtime value will be `dev`.

If we restore the `.env.local` file but this time run the production server then the runtime value will be `local`. However, if we delete the `.env.local` file again and restart the production server then the runtime value will be `prod`.

If we now set the shell/terminal environment to contain `APP_NAME=shell` and restart the server then the runtime value will be `shell` because the shell/terminal environment value overrides all others.

## Client-side vs Server-side

There are two types of environment variables: _client-side_ and _server-side_.

_Client-side_ environment variables are made available client-side in the browser and are prefixed with `NEXT_PUBLIC_` to indicate this. Any environment variable that needs to be accessible client-side must be given this prefix. Since these variables are accessible browser-side they must **not** hold sensitive passwords, API keys or any other information that browser clients are not meant to see. 

_Server-side_ environment variables are **only** available server-side and are **never** sent to the browser. Thus these variables can hold sensitive passwords, API keys and other information that browser clients are not meant to see.

!!!
All client-side environment variables are automatically available to server-side code. Thus, variables that are meant to be accessible in both places should be specified as client-side variables prefixed with `NEXT_PUBLIC_`.
!!!

### .env* files

The `.env*` files use the INI file format:

```ini
# a comment
SERVER_WALLET_PRIVATE_KEY=0x...
# quotes are allowed
APP_NAME="quickest dapp"

# another comment after some space
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```


Key points to note:

* The `.env` file is **required.** This file should contain values suitable for local development as well as any values which are unlikely to change across environments. It gets bundled into production and Docker builds and can be checked into source control.
* The `.env.development` and `.env.production` files are already _git-ignored_ and should **never** be checked into source control.
  * The `.env.development` file gets loaded when the app is run in dev server mode.
  * The `.env.production` file gets loaded when building production version of the app, running the production version and it also gets bundled into Docker images.
* The `.env.local` file is for further customization in all environments, e.g if you are temporarily testing a value different to the default. However, note that it does **not** get bundled into Docker images.

## Accessing variables at runtime

The `src/config/**` modules are responsible for loading, parsing and ensuring the right syntax for the each of various environment variables. It is recommended that your code access environment variables through this rather than accessing `process.env` directly. 

_Note: The [env-var](https://www.npmjs.com/package/env-var) package is used for parsing values and ensuring they adhere to a specified format_.

### Client-side

```typescript
import { clientConfig } from '@/config/client'

console.log(clientConfig.BASE_URL) // http://localhost:3000
```

!!!
Although client-side variables are defined with the `NEXT_PUBLIC_` prefix, at runtime the prefix gets removed to make your code more readable.
!!!

### Server-side

```typescript
import { serverConfig } from '@/config/server'

console.log(serverConfig.APP_NAME) // quickest dapp
```

## Adding your own variables

To add your own custom environment variable:

1. Add your variable to either `src/config/client.ts` or `src/config/server.ts` depending on whether it is a client-side or server-side variable. Follow the conventions used for existing environment variables, including removing the `NEXT_PUBLIC_` prefix at runtime for client-side variables.
1. Add a default value for your variable to the `.env` file, again following the conventions shown in in the file for other variables. If your variable does not have a default value then set its value inside `.env` to the empty string (`""`).
1. Optionally add a value override for your variable to either or both of `.env.development` and `.env.production`.

### Example

Let's add a client-side variable called `SHOW_COOKIE_BANNER` which will specify whether a cookie consent banner should be shown to the user. Our requirements for this variable:

* It can only be a boolean value - `true` or `false`.
* It should be `false` in development environments.
* It should be `true` in production environments.

First, we will edit `src/config.client.ts` to add the variable:

```typescript
// File: src/config/client.ts

export interface ClientConfigInterface {
  ...
  SHOW_COOKIE_BANNER: boolean
}

export const clientConfig = (() => {
  const env = require('env-var').from({
    ...
    SHOW_COOKIE_BANNER: process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER,
  })

  return Object.freeze({
    ...
    SHOW_COOKIE_BANNER: env.get('SHOW_COOKIE_BANNER').asBoolean(),
  }) as ClientConfigInterface
})()
```

In `.env` we set it to `false`:

```ini
# File: .env
...
NEXT_PUBLIC_SHOW_COOKIE_BANNER=false
```

In `.env.production` we set it to `true`:

```ini
# File: .env.production
...
NEXT_PUBLIC_SHOW_COOKIE_BANNER=true
```


