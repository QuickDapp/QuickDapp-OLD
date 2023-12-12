---
order: -1
---

# Getting started

This video show you how to get started. If you'd rather read through them then skip to the text below.

**TODO video embed**

## Step 1 - Source code

Goto the [QuickDapp releases](https://github.com/QuickDapp/QuickDapp/releases) page and download and unzip the latest release source code into a local folder.

!!!
If you're feeling brave then feel free to simply fork from the latest `master` branch code at https://github.com/QuickDapp/QuickDapp/tree/master
!!!

## Step 2 - Dependencies

In the project folder, run:

```shell
pnpm i
```

Now, let's bootstrap the project and generate the initial scaffolding:

```shell
pnpm bootstrap
```

## Step 3 - Postgres database

By default, QuickDapp assumes the existence of a [Postgres](https://www.postgresql.org/) database. The default connection parameters (defined in the `.env` file) are:

* host: `localhost`
* port: `5432`
* user: `postgres`
* db: `quickdapp`
* schema: `public`

Install Postgres on your system and create the `quickdapp` database, ensuring the `postgres` user has full system-level privileged access to it.

## Step 4 - Demo contracts deployed locally

The QuickDapp source code is actually a fully working Dapp which lets you deploy and interact with custom ERC-20 token contracts. The smart contract used is from the public [@QuickDapp/contracts](https://github.com/quickDapp/contracts) repository.

This [@QuickDapp/contracts](https://github.com/quickDapp/contracts) repository contains commands to setup a local node (using [Anvil](https://www.alchemy.com/dapps/foundry-anvil)) and deploy the proxy contract to it.

First, clone this repository into the QuickDapp project folder:

```shell
git clone git@github.com:QuickDapp/contracts.git
```

There should now be a `./contracts` folder. Now let's set it up:

```
pnpm contracts setup
```

Now let's run the local Anvil node and deploy the Diamond Proxy to it, and watch for changes:

```shell
pnpm contracts dev
```

When you run the above command you will see output which looks like this:

```
Enter the following line into your .env.development or .env.local file:
                                                                               
NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

Follow the instructions and place this into either one of those files. Create the file if it doesn't exist.

At this point we have locally running Anvil node with our upgradeable proxy contract deployed to it.

## Step 5 - Setup metamask

The local node pre-funds a number of test wallets with money. The mnemonic used to generate these wallets is usually:

```
test test test test test test test test test test test junk
```

_Note: Double-check that this mnemonic is correct by comparing with with the anvil node output above_

Enter this mnemonic into your browser Metamask wallet to ensure you can use these accounts to interact with the contract that is now deployed on your local node.

## Step 6 - Run dev servers

Now we're ready to run the dapp and test it locally. In the QuickDapp folder:

```shell
pnpm dev
```

This does the following:

* Starts the Next.js dev server mode.
* Starts the worker process dev server.

## Step 7 - Interact with the dapp

Goto http://localhost:3000 in your Metamask-enabled browser to interact with the dapp!



