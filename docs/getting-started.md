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

!!!
The contract is actually an upgradeable [Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535) proxy contract. Obviously you can choose to use your own contract architecture, but for the sake of this demo we're doing it this way.
!!!

This [@QuickDapp/contracts](https://github.com/quickDapp/contracts) contains commands to setup a local node (using [Anvil](https://www.alchemy.com/dapps/foundry-anvil)) and deploy the proxy contract to it.

Firtst, clone this repository into a new folder:

```shell
git clone git@github.com:QuickDapp/contracts.git
```

Now go into that repo folder:

```
cd contracts
```

Install the dependencies:

```shell
pnpm i && pnpm setup
```

Create a `.env` file and set its contents to:

```
LOCAL_RPC_URL=http://localhost:8545
```

Now, in a new terminal window in the same folder run the local node:

```
pnp devnet
```

_Note: This will start an anvil node with a chain id of 1337 and a block time of 5 seconds_

In the original terminal window you can now deploy the contracts to this node:

```shell
pnpm dep local -n
```

The output should look something like:

```
GEMFORGE: Working folder: /Users/ram/dev/QuickDapp/contracts
GEMFORGE: Selected target: local
GEMFORGE: Setting up target network connection "local" ...
GEMFORGE:    Network chainId: 1337
GEMFORGE: Setting up wallet "wallet1" ...
GEMFORGE: Wallet deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
GEMFORGE: New deployment requested. Skipping any existing deployment...
GEMFORGE: Deploying diamond...
GEMFORGE:    DiamondProxy deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
GEMFORGE: Loading user facet artifacts...
GEMFORGE:    1 facets found.
GEMFORGE: Loading core facet artifacts...
GEMFORGE: Resolving what changes need to be applied ...
GEMFORGE:    1 facets need to be deployed.
GEMFORGE:    1 facet cuts need to be applied (Add = 1, Replace = 0, Remove = 0).
GEMFORGE: Deploying facets...
GEMFORGE:    Deploying ERC20Facet ...
GEMFORGE:    Deployed ERC20Facet at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
GEMFORGE: Deploying initialization contract: InitDiamond ...
GEMFORGE:    Initialization contract deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
GEMFORGE: Encoding initialization call data...
GEMFORGE: Calling diamondCut() on the proxy...
GEMFORGE: Deployments took place, saving info...
GEMFORGE: Running post-deploy hook...
Skipping verification on local
GEMFORGE: All done.
```

Note the address of the `DiamondProxy` contract. In the above output it's `0x5FbDB2315678afecb367f032d93F642f64180aa3`.

Go back to the QuickDapp project folder:

```shell
cd ../QuickDapp
```

Create a `.env.development` file with the address defined as follows:

```
NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS=<the address obtained above>
```

## Step 5 - Setup metamask

The anvil node pre-funds a number of test wallets with money. The mnemonic used to generate these wallets is usually (double-check with the anvil node output above):

```
test test test test test test test test test test test junk
```

Enter this mnemonic into your browser Metamask wallet to ensure you can use these accounts to interact with the contract that is now deployed on your local node.

## Step 6 - Run dev servers

Now we're ready to run the dapp and test it locally. In the QuickDapp folder:

```shell
pnpm dev
```

This does the following:

* Starts the Next.js dev server mode.
* Starts the worker process dev server.

Goto http://localhost:3000 in your Metamask-enabled browser to interact with the dapp!



