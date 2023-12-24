---
icon: workflow
order: 81
expanded: true
---

# Smart contracts

QuickDapp is setup to work with forks of the [@QuickDapp/contracts repository](https://github.com/quickDapp/contracts).

You can of course use whatever smart contract architecture you want but it's worth forking the default contracts repository as a starting point since it is setup to make development easy.

The default repository has the following features:

* Upgradeable proxy contract based on the [EIP-2535 Diamond Standard](https://www.quicknode.com/guides/ethereum-development/smart-contracts/the-diamond-standard-eip-2535-explained-part-1).
* Deployments and upgrades (both dev and production) managed using [Gemforge](http://gemforge.xyz).
* Generates an ABI for the proxy contract to be used by your dapp.
* Works with the [`contracts` command](../command-line/contracts.md) out of the box.




