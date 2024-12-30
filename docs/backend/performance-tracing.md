---
order: 89
---

# Performance tracing

QuickDapp has built-in support for [Sentry](https://sentry.io/) performance tracing. This is the process of measuring how long requests take to complete, including method calls made within. A typical trace may look something like this:

![An example OpenTelemtry trace](/static/trace.png)

To enable tracing the following [environment variables](../environment-variables.md) need to be set:

* `SENTRY_WORKER_DSN` - for the worker app
* `NEXT_PUBLIC_SENTRY_DSN` - for the web app

If you want traces to be matched against source code properly you will also need to set:

* `SENTRY_AUTH_TOKEN`

Where possible, traces will have the user wallet address attached to them so that it's easier to track a given user's requests through the system.

## Session replays 

As part of tracing, browser [session replays](https://docs.sentry.io/product/explore/session-replay/) are also enabled by default. This allows you to see exactly what your users see when they use your dapp. This makes it easier to debug problems and figure out how to improve your UX.

