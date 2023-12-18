---
order: 98
---

# Global context

The [`GlobalContext`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/contexts/global.tsx) object contains information on the currently authenticated user and their wallet, the currently connected blockchain as well as an interface for accessing push notifications.

```ts
export interface Wallet {
  isAuthenticated: boolean
  client: WalletClient
  address: string
  addressTruncated: string
}

export interface GlobalContextValue {
  wallet?: Wallet
  ably?: Ably.Types.RealtimePromise
  chain: ReturnType<typeof useNetwork>['chain']
}
```

The context is accessed through the `useGlobalContext()` hook as such:

```ts
const Comp = () => {
  const globalContextValue = useGlobalContext();
  // ...
}
```

