---
order: 99
---

# contracts

The `contracts` command is responsible for:

* Initializing the contracts repository in the `contracts/` folder.
* Running a local node and deploying the contracts to it
* Re-building and redeploying when contract code changes.

!!!
This command assumes that the concracts are in the `contracts/` sub-folder and that they are based on the 
[official contracts](../smart-contracts/index.md) repository.
!!!


## Initialize contracts

```shell
pnpm contracts bootstrap
```

This command must be run after the contracts folder has been setup. It will install any dependencies required to build and deploy contracts.


## Local development deployment

```shell
pnpm contracts dev
```

This does the following:

* Run a local [Anvil](https://www.alchemy.com/dapps/foundry-anvil) node
* Build and deploy the Diamond Proxy and associated facets to the local node
* Re-build and upgrade the on-chain contract whenever the contracts source code gets changed.

Rebuilding the contracts will cause the web and worker servers to auto-reload the ABI from the 
contracts folder. Thus, you can now develop your app code and contracts in tandem.
