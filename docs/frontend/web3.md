---
order: 100
---

# Web3

Web3 wallet discovery, authentication and interaction is facilitated via [RainbowKit](rainbowkit.com), [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/) and [Sign-in-with-Ethereum](https://docs.login.xyz/general-information/siwe-overview).

## Chain configuration

QuickDapp is built for EVM chains. The target EVM chain is specified via the following [environment variables](../environment-variables.md):

* `NEXT_PUBLIC_CHAIN`
* `NEXT_PUBLIC_CHAIN_RPC_ENDPOINT`git 

Note that both variables are needed for the chain configuration to work correctly. The backend server and worker processes also rely on these environment variables to know which chain to monitor.

## Connection and authentication

The [`ConnectWallet`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/components/ConnectWallet.tsx) component triggers the RainbowKit connection dialog. By default, once a wallet is connected the user is prompted to sign a message with their private key to prove that they actually own this wallet. 

The signed message is sent to the backend for verification. Once verified, a JWT (JSON Web Token) is used to store the user's sessions for any subsequent [queries](./graphql.md) made to the backend. The [global context](./global.md) object will also be updated to contains the user's wallet information.

The user remains authenticated across browser sessions until and unless the user changes their active wallet and/or manually disconnects from the dapp.

_Note: If the user's crypto wallet is connected to a different chain then they will be prompted to switch to the right chain._

### App name

The `src/shared/constants.ts` file contains the app name that will be shown to users during the wallet connection process. Update these values accordingly:

```ts
export const APP_NAME = 'QuickDapp'
```

## Contracts

_Please refer to the the section on [Smart Contracts](../smart-contracts/index.md)_.

### Read/write hooks

The following high-level contract interaction hooks are [provided](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/hooks/contracts.ts):

* `useGetContractValue` - call a read-only method on a single contract.
* `useGetMultipleContractValues` - call multiple read-only methods on multiple contracts. _(Note: The [background worker](../worker/index.md) will deploy [Multicall3](https://www.multicall3.com/) to the chain if not already present)_.
* `useGetContractPaginatedValues` - read paginated values from a single contract.
* `useSetContractValue` - call a read-write method on a contract with a transaction.

You can of course use the Wagmi React hooks to access contract methods if you wish. However, the above hooks incorporate the ABI and address fetching methods above to provide for a more seamless interaction with contracts.

!!!
The default QuickDapp dapp (the built-in ERC-20 demo) utilises all of these hooks, providing you with working code examples.
!!!

### Contract write simulation

The `useSetContractValue` internally simulates the transaction prior to executing it. It doesn't use Wagmi's default `useWriteContract` hook, instead opting to manually use the wallet client instance to make the calls. This allows us for better error management.

Of course, you can choose to not use this and use `useWriteContract` hook instead. Or create your own wrapper around the wallet client. It's upto you!