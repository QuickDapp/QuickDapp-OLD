---
order: 100
---

# Introduction

**QuickDapp** is a highly opinionated framework that helps you quickly build _and_ deploy Web3 dapps, batteries included. 

It is designed to save you a massive amount of time and effort, freeing you up to focus on the parts of your dapp that actually matter.

Roughly speaking, it integrates the following:

* [Typescript](https://www.typescriptlang.org/) + [Next.js](https://nextjs.org/) + [React](https://react.dev/) as the foundation.
* [TailwindCSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) + [shadcn/ui](https://ui.shadcn.com/) for components and styling.
* [Prisma](https://www.prisma.io/) + [Postgres](https://www.postgresql.org/) for database storage.
* [React-query](https://tanstack.com/query/latestap) + [GraphQL](https://graphql.org/) for AJAX calls.
* [RainbowKit](rainbowkit.com) + [SIWE](https://login.xyz/) + [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/) for all web3 authentication + interaction.
* Background job scheduling _"worker"_ with support for cron jobs, repeat-on-failure logic, etc.
* Diamond standard-based upgradeable smart contracts, see [@QuickDapp/contracts](https://github.com/quickDapp/contracts) repository.
* [Commander](https://www.npmjs.com/package/commander) + [Enquirer](https://www.npmjs.com/package/enquirer) for powerful CLI scripts.
* [Docker](https://www.docker.com/) build scripts for deploying as containers.
* [Retype](https://retype.com/) for beautiful, locally-runnable docs.
* [DigitalOcean](https://www.digitalocean.com/) for production deployments.
* [Sendgrid](https://www.sendgrid.com/) integration for email sending.
* [Ably](https://ably.com/) integration for real-time push notifications to clients.
* [Datadog](https://www.datadoghq.com/) integration for cloud logging and browser session capture.

As you can see above, QuickDapp does a lot for you out of the box. 

QuickDapp also comes with a built-in , etc. You can deploy the worker process as its own Docker image whilst deploying the Next app to a serverless cloud (e.g Vercel). Or you can combine the two into a single Docker image. All using the readily available build scripts.

Also, the base QuickDapp distribution is itself a ready-made dapp (see [live demo](https://demo.quickdapp.com)) which  lets you deploy and interact with ERC-20 contracts on [Sepolia](https://sepolia.etherscan.io) so that you can see all the elements of a working dapp from the get-go.

## Why does this exist?

If you've ever multiple dapps you'll have found yourself reusing code and integrations from one dapp to the next to save time. Still, you'll need to spend time change the base layer to suite the new dapp. 

Now, imagine the reusable part of a dapp was re-built to be generically usable for any dapp with some sensible defaults included. And imagine it had ready integrations for cloud deployment with baked-in support for useful third-party services. This would save you a tonne of time.

This is exactly what QuickDapp is.

## What if I don't like something?

QuickDapp has been carefully designed to give you the flexibility to build whatever you want without having to change the core structure. However, you may wish to replace some of the peripheral components (e.g the cloud logging provider) with your own choices.

In these cases it's easy to do so since QuickDapp is distributed as source code which you then modify/enhance to build your dapp. Meaning that any and every aspect of QuickDapp can be modified as you see fit. There are no limits or restrictions.

Note that parts of the documentation will touch on how you can customize and/or replace certain components to your liking whilst still taking advantage of QuickDapp's other useful features.

## Where do I start?

The [Getting Started](./getting-started.md) section will get you up and running quickly. 

The remainder of this documentation gives you a thorough understanding of all the different parts of QuickDapp and how to get the most out of the framework as a whole.
