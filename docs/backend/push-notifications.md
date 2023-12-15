---
order: 50
---

# Push notifications

Real-time push notifications can be sent to browser clients using [Ably](https://ably.com/). The code is in `src/backend/bootstrap.index.ts`.

All of the following [environment variables](../environment-variables.md) must be set for this to be enabled:

* `ABLY_API_KEY` - the Ably API key.

If enabled then the `ably` property in the [bootstrapped object](./bootstrapped.md) will be set.


