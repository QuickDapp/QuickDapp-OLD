---
order: 98
---

# Global context

The [`GlobalContext`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/contexts/global.tsx) object contains information on the currently authenticated user and their wallet, the currently connected blockchain as well as an interface for accessing push notifications.

The context is accessed through the `useGlobalContext()` hook as such:

```ts
const Comp = () => {
  const globalContextValue = useGlobalContext();
  // ...
}
```

