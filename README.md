# QuickDapp

QuickDapp is a highly opinionated framework that helps you quickly build _and_ deploy Web3 dapps, batteries included. 

It is designed to save you a massive amount of time and effort, freeing you up to focus on the parts of your dapp that actually matter.

Roughly speaking, it integrates the following:

* [Typescript](https://www.typescriptlang.org/) + [Next.js](https://nextjs.org/) + [React](https://react.dev/) as the foundation.
* [TailwindCSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) + [shadcn/ui](https://ui.shadcn.com/) for components and styling.
* [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) for database storage.
* [React-query](https://tanstack.com/query/latestap) + [GraphQL](https://graphql.org/) for AJAX calls.
* [RainbowKit](rainbowkit.com) + [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/) for web3 interaction.
* [NextAuth](https://next-auth.js.org/) + [Sign-in-with-Ethereum](https://login.xyz/) for wallet authentication.
* Background job scheduling _"worker"_ with support for cron jobs, repeat-on-failure logic, etc.
* Diamond standard-based upgradeable smart contracts, see [@QuickDapp/contracts](https://github.com/quickDapp/contracts) repository.
* [Commander](https://www.npmjs.com/package/commander) + [Enquirer](https://www.npmjs.com/package/enquirer) for powerful CLI scripts.
* [Docker](https://www.docker.com/) build scripts for deploying as containers.
* [Retype](https://retype.com/) for beautiful, locally-runnable docs.
* [DigitalOcean](https://www.digitalocean.com/) for production deployments.
* [Sendgrid](https://www.sendgrid.com/) integration for email sending.
* [Ably](https://ably.com/) integration for real-time push notifications to clients.
* [Datadog](https://www.datadoghq.com/) integration for cloud logging and browser session capture.

Please visit https://quickdapp.xyz for more information. A live demo of the built-in app is available at https://demo.quickdapp.xyz.

## Getting started

Pre-requisites:

* [Node.js](https://nodejs.org/) v20+.
* [PNPM](https://pnpm.io/).
* [PostgreSQL](https://www.postgresql.org/) 11+ running locally on port 5432, with a default admin user called `postgres`.

Install the packages:

```shell
pnpm i
```

Run the bootstrap script:


```shell
pnpm bootstrap
```

Please refer to the _"Getting Started"_ tutorial for further instructions. You can display the documentation in the browser by running:

```shell
pnpm showdocs
```

## License

All Rights Reserved.