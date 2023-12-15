---
order: 100
---

# Bootstrap object

The `src/backend/boostrap/index.ts` file contains code which is executed on every backend API and/or page invocation. This code _bootstraps_ basic backend services and returns a corresponding `BootstrappedApp` object which looks something like:

```ts
export interface BootstrappedApp {
  mailer?: ...
  ably?: ...
  db: ...
  log: ...
  chainClient: ...
  serverWallet: ...
  notifyUser: (...) => Promise<void>
}
```

This object operates as a sort of backend application-level context and gets passed around the various components of the backend code.

For any application-level objects or services used throughout your backend, it is recommended that you define them in the `BootstrappedApp` interface and then initialize them within the bootstrap code.
