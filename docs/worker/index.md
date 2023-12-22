---
icon: checklist
order: 93
expanded: true
---

# Background worker

QuickDapp bundles a background worker process that runs in parallel to the Next.js server process, so that you can schedule long-running persistent background jobs at any time. 

## Why it's useful

Next.js apps tend to be deployed to serverless environments for scalability and efficiency reasons. As such, there is no persistent server, meaning there is no way to run a backend process which persists beyond the lifetime of an incoming request.

Although one could use a cron service to periodically call a Next.js route, many serverless clouds (e.g Vercel) cap the duration for which any given route can run, limiting the work that can be done. In any case, a serverless architecture is not the ideal approach for long-running background jobs.

## How it works

Jobs are scheduled via the `WorkerJob` [database](../backend/database.md) table. All job results (both successes and failures) are logged. If a job fails it can be set to automatically retry after a predefined delay. Jobs can also be run regularly according to a [cron schedule](https://crontab.guru/).

The worker process has full access to all of the same [backend resources](../backend/index.md) as the Next.js server. However, it does not deal with any frontend resources and does not listen for incoming connections. Thus, to know what's going on with a worker process you will need to monitor the database as well as log messages.

!!!
Although it's possible to run more than 1 worker process to scale up, note that there is currently no [mutex](https://en.wikipedia.org/wiki/Mutual_exclusion) mechanism to prevent two or more workers may end up executing the same task at the same time. Though this is unlikely to happen often anyway, it should be noted that it could happen.
!!!

## Configuration

It loads its configuration from the same [environment variables](../environment-variables.md) as every other part of your dapp.

The only worker-specific environment variables are:

* `WORKER_LOG_LEVEL` - Minimum logging threshold level. Allows you to log worker process messages at a different minimum threshold to that of the Next.js backend.

## Database table

Any data returned by a job's `run()` method will be stored as JSON in the worker job table row corresponding to that particular invocation of the job.
