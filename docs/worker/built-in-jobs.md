---
order: 95
---

# Built-in jobs

There are two built-in worker jobs which are set to run on a cron schedule:

* [`removeOldWorkerJobs`](https://github.com/QuickDapp/QuickDapp/tree/master/src/worker/jobs/removeOldWorkerJobs.ts) - Removes _successfully_ completed jobs. **Runs every minute.**
* [`watchChain`](https://github.com/QuickDapp/QuickDapp/tree/master/src/worker/jobs/watchChain.ts) - Watches the blockchain for changes according to user-defined filters. **Runs every 5 seconds.**

## Watching the blockchain

Watching and reacting to blockchain events is done by defining user-defined filters in the `src/worker/chainFilters` folder. The built-in `watchChain` job uses these filters to watch the blockchain for changes.

The chain to watch is defined by the chain-related [environment variables](../environment-variables.md).

Each filter module must adhere to the following interface:


```ts
export interface ChainFilterModule {
  /** Create the filter to watch the chain. */
  createFilter: (chainClient: BootstrappedApp['chainClient']) => any
  /** Callback triggered when filter has changes to process. */
  processChanges: (app: BootstrappedApp, changes: any) => Promise<void>
}
```

!!!
The default bundled dapp has two filters  - `createToken`, `sendToken` - which serve as examples of how to use this architecture. Both filters listen for events emitted from the dapp contract.
!!!



