---
order: 98
---

# Getting started

## Step 0 - Pre-requisites

Ensure you have the following pre-requisites installed and ready:

* [Node.js](https://nodejs.org/) v20+.
  * _We recommend using [NVM](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions simultaneously._
* [PNPM](https://pnpm.io/).
* [PostgreSQL](https://www.postgresql.org/) 11+ running locally on port 5432, with a default admin user called `postgres`.

## Step 1 - Source code

Unzip the QuickDapp zip file you received when you purchased a license. If you are pro user then you can visit the repository at https://github.com/QuickDapp/QuickDapp and download a ZIP of any of the git version tags or you can just fork the `master` branch (if you're feeling brave!).

## Step 2 - Dependencies

In the project folder, let's install the dependencies:

```shell
pnpm i
```

Now, let's bootstrap the project and generate the initial scaffolding:

```shell
pnpm bootstrap
```

This installs a Git hook which ensures your future commit messages adhere to the [conventional commits](https://github.com/conventional-changelog/commitlint). It also generates the [Prisma client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client).


## Step 3 - PostgreSQL database

By default, QuickDapp assumes the existence of a [PostgreSQL](https://www.postgresql.org/) database. The default connection parameters (defined in the `.env` file) are:

* host: `localhost`
* port: `5432`
* user: `postgres`
* db: `quickdapp`
* schema: `public`

If you haven't already, create the `quickdapp` database, ensuring the `postgres` user has full system-level privileged access to it:

```shell
psql -U postgres -c 'CREATE DATABASE quickdapp'
```

Let's get the dev database setup:

```shell
pnpm dev db migrate
```

## Step 4 - Demo contracts deployed locally

The QuickDapp source code is actually a fully working Dapp which lets you deploy and interact with custom ERC-20 token contracts. The smart contract used is from the public [@QuickDapp/contracts](https://github.com/quickDapp/contracts) repository.

This [@QuickDapp/contracts](https://github.com/quickDapp/contracts) repository contains commands to setup a local node (using [Anvil](https://www.alchemy.com/dapps/foundry-anvil)) and deploy the proxy contract to it.

First, clone this repository into the QuickDapp project folder:

```shell
git clone git@github.com:QuickDapp/contracts.git
```

There should now be a `./contracts` folder. Now let's set it up:

```shell
pnpm contracts bootstrap
```

Now let's run the local Anvil node and deploy the Diamond Proxy to it, and watch for changes:

```shell
pnpm contracts dev
```

When you run the above command you will see output which looks like this:

```
Enter the following line into your .env.development or .env.local file:
                                                                               
NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS="0x79D219573A2b042479604aBA46BE7CECc52A57cd"
```

This address (usually it's `0x79D219573A2b042479604aBA46BE7CECc52A57cd`) is the address of the Diamond proxy contract that 
is now deployed to your locally running Anvil node.

Follow the instructions and place this line into either one of those files. Create the file if it doesn't exist.

At this point we have locally running Anvil node with our upgradeable proxy contract deployed to it.

## Step 5 - Setup metamask

The local node pre-funds a number of test wallets with money. The mnemonic used to generate these wallets is usually:

```
test test test test test test test test test test test junk
```

_Note: Double-check that this mnemonic is correct by comparing with with the anvil node output above_

Enter this mnemonic into your browser [Metamask wallet](https://metamask.io/) to ensure you can use these accounts to interact with the contract that is now deployed on your local node.

## Step 6 - Run dev servers

Now we're ready to run the dapp and test it locally. In the QuickDapp project folder:

```shell
pnpm dev
```

This does the following:

* Starts the Next.js dev server mode.
* Starts the worker process dev server.

## Step 7 - Interact with the dapp

Goto http://localhost:3000 in your Metamask-enabled browser to interact with the dapp!

## Step 8 - Deploying to production

The following steps all deal with deploying our dapp to production.

We will do the following:

* Deploy smart contracts to Sepolia test network.
* Deploy the dapp (both Next.js + background worker process) as a Docker image to DigitalOcean's App platform.
* Use a hosted PostgreSQL database on DigitalOcean as the production database.

!!!
If you wish, the Next.js dapp can be deployed by itself to [Vercel](https://vercel.com) and other serverless hosts very easily using their normal deployment processes. The docker image can just contain the background worker process. The choice is yours.
!!!

## Step 9 - Setup production database

We will setup a PostgreSQL database on [DigitalOcean](https://digitalocean.com) as our production database.

Pre-requisites:

1. Sign-up to [DigitalOcean](https://digitalocean.com).
1. Obtain a [Personal Access Token](https://docs.digitalocean.com/reference/api/create-personal-access-token/).
1. Create a [PostgreSQL database cluster](https://docs.digitalocean.com/products/databases/postgresql/how-to/create/).

In the QuickDapp project folder, create a `.env.production` file, entering the access token as follows:

```ini
DIGITALOCEAN_ACCESS_TOKEN="<the access token>"
```

Now let's setup a database in the cluster named `quickdapp`, with a user named `quickdappuser` to access it:

```shell
pnpm do-cloud db setup --name quickdapp --user quickdappuser
```

This command will output the database connection string, which will look similar to:

```
postgres://quickdappuser:password@postgres.digitalocean.com:25060/quickdapp?schema=public
```

Enter this connection string as the `DATABASE_URL` environment variable in the `.env.production` file, e.g:

```ini
DATABASE_URL="postgres://quickdappuser:password@db.digitalocean.com:25060/quickdapp?schema=public"
```

Now setup the production database schema:

```shell
pnpm prod db deploy
```

## Step 9 - Deploy contracts to Sepolia

We will deploy the contracts to the [Sepolia](https://www.alchemy.com/overviews/sepolia-testnet) test network. This means the production dapp will require the user's wallet be connected to Sepolia in order for interactions to work.

Pre-requisites:

1. Setup a new Ethereum wallet using a mnemonic (you can do this in Metamask).
1. Fund this new allet using the [Sepolia ETH faucet](https://sepoliafaucet.com/).

The following two environment variables need to be set in the shell environment for the deployment to work:

* `MNEMONIC` - Mnemonic to the new wallet setup earlier.
* `SEPOLIA_RPC_URL` - RPC endpoint for accessing Sepolia. You can get one from [Alchemy](https://www.alchemy.com).

Set these environment variables in the shell environment:

```shell
export MNEMONIC=
export SEPOLIA_RPC_URL=
```

Now go into the contracts folder and run:

```shell
pnpm dep sepolia
```

Note down the deployed proxy contract address from the log output. The address can also be found inside the `gemforge.deployments.json` file.

Go back into the QuickDapp project folder and edit the `.env.production` file, adding the proxy address follows:

```ini
NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS="<Sepolia deployed proxy address>"
```
You are now ready to build the production dapp.

## Step 10 - Test-run production build locally

_Note: This step is optional, and is useful it you want to debug some production issues locally_

In the project folder, build the production apps:

```shell
pnpm build
```

Now, run the production apps:

```shell
pnpm prod
```

Now goto http://localhost:3000 in your Metamask-enabled browser to interact with the dapp. You will need to connect to the Sepolia test network in your wallet.

## Step 11 - Build docker image

We are going to build a Docker image to run both the Next.js app and background worker processes in tandem.

Pre-requisites:

1. Install [Docker](https://www.docker.com) and ensure that the Docker daemon is running in the background.

In the project folder run:

```shell
pnpm docker build
```

This will build a Docker image named `quickdapp-all`.

You can test-run this image locally using:

```shell
pnpm docker run
```

Now goto http://localhost:3000 in your Metamask-enabled browser to interact with the dapp. You will need to connect to the Sepolia test network in your wallet.

## Step 12 - Deploy to DigitalOcean

To push the `quickdapp-all` image to DigitalOcean:

```shell
pnpm do-cloud docker push
```

This will create a container registry named `quickdapp` if it doesn't already exist and push the local image to it.

At this point we can use the App platform to create an app from this image. Follow the [official docs](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-container-images/) for instructions on how to do this.

If the App build succeeds (and it should!) your dapp will be up and running at the URL presented by DigitalOcean.

Now, every time you push an updated image to the container registry the App will auto-redeploy.

## Step 13 - Hurrah!

**Congratulations! your dapp is now available on the web in production mode.**

If you wish to gain more insight into what your dapp is doing a good starting point is to enable [cloud logging](./backend/logging.md).



