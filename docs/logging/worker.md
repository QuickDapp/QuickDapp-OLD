---
order: 70
---

# Worker

Sentry is enabled for the worker process too. However, it's highly recommend that you use a different Sentry project for the worker since it's a different computer process altogether. Hence why there is a separate [environment variable](../environment-variables.md) to be set for the Worker data ingestion endpoint:

* `SENTRY_WORKER_DSN`

