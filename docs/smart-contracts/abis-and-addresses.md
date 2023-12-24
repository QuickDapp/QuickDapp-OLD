---
order: 99
---

# ABIs and addresses

All required ABIs and contract addresses should be specified in [`src/shared/contracts.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/contracts.ts), following the format there-in.

The following methods are provided:

* `getContractInfo` - returns ABI of a contract
* `getDeployedContractInfo` - returns ABU and address of a contract on a given chain.
* `getMulticall3Info` - returns address of [Multicall3](https://www.multicall3.com/) contract on the current chain. _(Note: the address should be the same on every chain)_.

