---
order: 97
---

# Adding a job

To create a new type of job a new file must be added to `src/worker/jobs` which adheres to the `Job` interface:

```ts
export interface JobParams {
  app: BootstrappedApp
  log: LogInterface
  job: WorkerJob
}

export type JobRunner = (params: JobParams) => Promise<any>

export interface Job {
  run: JobRunner,
}
```

!!!
In [dev](../command-line/dev.md) mode, when any changes are made to the `src/worker/jobs` folder contents a code generator automatically re-generates the Typescript bindings (see `src/worker/generated`) - these are used by worker-related database methods.
!!!

## Scheduling a job

The two job scheduling methods are:

```ts
* `scheduleJob()` - One-off job run.
* `scheduleCronJob()` - Cron task which runs a job on a regular schedule.
```

A job is specified as follows:

```ts
export interface WorkerJobConfig<T extends object> {
  /** Maps to a job defined in src/worker/jobs */
  type: WorkerJobType
  /** User this job is for. Use 0 for system-level jobs. */
  userId: number
  /** When job must be executed. Default is right now. */
  due?: Date
  /** Any data to be passed to job `run()` method. */
  data?: T
  /** Whether to auto-retry on failure. */
  autoRescheduleOnFailure?: boolean
  /** No. of milliseconds to wait before retrying a failed job. */
  autoRescheduleOnFailureDelay?: number
  /** No. of milliseconds to wait before removing the job from the database once it has successfully completed. */
  removeDelay?: number
}
```

The `scheduleCronJob()` method additionally requires a [crontab](https://crontab.guru/) specification.

## Pending jobs 

When a new job is scheduled any matching _pending_ jobs are first cancelled. 

A matching pending job is one which has **all** the following properties:

* It has the same `type` and `userId` as the new job.
* It has not yet started OR it started over an hour ago but is yet to complete.

**Thus, you should ensure any given job doesn't execute for longer than an hour.**

## Database table

Regarding the worker database table schema, the following two fields should be noted:b

* `result` - The data returned by the job's `run()` method if successful.
* `rescheduledFromJob` - If the job has been rescheduled from an earlier job  (whether due to a cron schedule or as an auto-retry-on-failure) this field will hold a reference to that earlier job.

