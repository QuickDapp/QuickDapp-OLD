---
icon: clock
order: -2
expanded: true
---

# Authentication

The database 

Next.js apps tend to be deployed to serverless environments for scalability and efficiency reasons. As such, there is no persistent server, meaning there is no way to run a backend process which persists beyond the lifetime of an incoming request.

For this reason, QuickDapp bundles a background worker process that runs in parallel to the Next.js server process, so that you can schedule long-running persistent background jobs at any time.

Jobs are scheduled via a database table. All job results are logged. Jobs can be automatically scheduled using a cronjob syntax. If a job fails it can be set to automatically retry after a predefined delay.

The worker process has full access to all of your backend resources, including the database. It also loads its configuration from the same [environment variables](../environment-variables.md) as Next.js.

!!!
Although the worker process is suitable for production use, it's designed to get you up and running quickly with background tasks and should probably be replaced with more established systems once your app hits scale.
!!!
