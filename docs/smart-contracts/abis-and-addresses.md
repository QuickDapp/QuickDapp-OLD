---
order: 99
---

# ABIs and addresses

The [`src/shared/abi/config.json`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/abi/config.json) specifies what contract ABIs should be made available to your application and how to generate them 
based on Solidity compiler output. 

The configuration schema provides for combining multiple compiled output JSONs into a single ABI structure - this is especially useful in situations where events and erros are defined in interfaces and other files 
separate to the main contract's source code.

For example, the default `config.json` looks as follows:

```json
{
  // The name of the ABI at runtime, will be referencable via the `ContractName` enum as `ContractName.Erc20`
  "Erc20": [
    // a location to load ABI fragments from
    {
      // loads from all files which match this pattern
      "glob": "../data/erc20abi.json"
    }
  ],
  "DiamondProxy": [
    {
      "glob": "../../../contracts/out/IDiamondProxy.sol/IDiamondProxy.json",
      // The "path" inside the JSON file above at this the ABI fragments actually sit. For Foundry compilation output it's usually the `abi` key. If ommitted then the JSON file itself is assumed to be the ABI.
      "keyPath": "abi"
    },
    {
      "glob": "../../../contracts/out/**/**.json",
      "keyPath": "abi",
      // The types of ABI fragments to include in the generated output. If ommitted then all fragments are included.
      "types": ["error", "event"]
    }
  ]
}
```

The code generator will then generate a Typescript file based on this configuration and - when running [dev](../command-line/dev.md) mode - watch for configuration changes and rebuild accordingly. 

The generated Typescript file is located at `src/shared/abi/generated.ts` and is referenced by the [`src/shared/contracts.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/shared/contracts.ts) file. This 
file provides the following methods:

* `getContractInfo` - returns ABI of a contract
* `getDeployedContractInfo` - returns ABU and address of a contract on a given chain.
* `getMulticall3Info` - returns address of [Multicall3](https://www.multicall3.com/) contract on the current chain. _(Note: the address should be the same on every chain)_.

