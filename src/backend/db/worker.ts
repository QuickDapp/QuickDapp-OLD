import { PrismaClient, WorkerJob } from '@prisma/client'
import { parseCronExpression } from 'cron-schedule'
import { ONE_HOUR, dateFrom } from '../../shared/date'
import { WorkerJobType } from '../../worker/generated/exportedTypes'
import { BootstrappedApp } from '../bootstrap'

export interface WorkerJobConfig<T extends object> {
  type: WorkerJobType
  userId: number
  due?: Date
  data?: T
  autoRescheduleOnFailure?: boolean
  autoRescheduleOnFailureDelay?: number
  removeDelay?: number
}

export const pendingJobsQueryFilter = (extraCriteria?: any): any => ({
  OR: [
    {
      started: {
        equals: null,
      },
    },
    {
      started: {
        // if a job has been started but not finished within in 1 hour, we assume it's still pending
        lte: dateFrom(Date.now() - ONE_HOUR),
      },
    },
  ],
  AND: {
    finished: {
      equals: null,
    },
    ...extraCriteria,
  },
})

export const inProgressOrPendingJobsQueryFilter = (extraCriteria?: any): any => ({
  finished: {
    equals: null,
  },
  ...extraCriteria,
})

const cancelPendingJobs = async (app: BootstrappedApp, filter: any) => {
  return await app.startSpan('db.cancelPendingJobs', async () => {
    // update existing jobs for this user to be cancelled
    await app.db.workerJob.updateMany({
      where: pendingJobsQueryFilter(filter),
      data: {
        started: new Date(),
        finished: new Date(),
        success: false,
        result: {
          error: 'Job cancelled due to new job being created',
        },
        updatedAt: new Date(),
      },
    })
  })
}

const sanitizeJobData = (data?: any) => {
  return (data || {}) as object
}

const generateJobDates = (due?: Date, removeDelay?: number) => {
  due = due || new Date()

  return {
    due,
    removeAt: dateFrom(due.getTime() + (removeDelay || 0)),
  }
}

export const scheduleJob = async <T extends object>(app: BootstrappedApp, job: WorkerJobConfig<T>) => {
  return await app.startSpan('db.scheduleJob', async () => {
    await cancelPendingJobs(app, {
      type: job.type,
      userId: job.userId,
    })

    // create new job
    return await app.db.workerJob.create({
      data: {
        userId: job.userId,
        ...generateJobDates(job.due, job.removeDelay),
        type: job.type,
        data: sanitizeJobData(job.data),
        autoRescheduleOnFailure: !!job.autoRescheduleOnFailure,
        autoRescheduleOnFailureDelay: job.autoRescheduleOnFailureDelay || 0,
        removeDelay: job.removeDelay || 0,
      },
    })
  })
}

export const scheduleCronJob = async <T extends object>(app: BootstrappedApp, job: WorkerJobConfig<T>, cronSchedule: string) => {
  return await app.startSpan('db.scheduleCronJob', async () => {
    await cancelPendingJobs(app, {
      type: job.type,
      userId: job.userId,
    })

    // create new job
    return await app.db.workerJob.create({
      data: {
        userId: job.userId,
        ...generateJobDates(parseCronExpression(cronSchedule).getNextDate(new Date())),
        type: job.type,
        data: sanitizeJobData(job.data),
        cronSchedule,
        autoRescheduleOnFailure: !!job.autoRescheduleOnFailure,
        autoRescheduleOnFailureDelay: job.autoRescheduleOnFailureDelay || 0,
        removeDelay: job.removeDelay || 0,
      },
    })
  })
}

export const getTotalPendingJobs = async (app: BootstrappedApp) => {
  return await app.startSpan('db.getTotalPendingJobs', async () => {
    return app.db.workerJob.count({
      where: pendingJobsQueryFilter(),
    })
  })
}

export const getNextPendingJob = async (app: BootstrappedApp) => {
  return await app.startSpan('db.getNextPendingJob', async () => {
    return app.db.workerJob.findFirst({
      where: pendingJobsQueryFilter(),
      orderBy: {
        due: 'asc',
      },
    })
  })
}

export const gerInProgressOrPendingJobOfTypeForUser = async (app: BootstrappedApp, userId: number, type: WorkerJobType) => {
  return await app.startSpan('db.gerInProgressOrPendingJobOfTypeForUser', async () => {
    return app.db.workerJob.findFirst({
      where: inProgressOrPendingJobsQueryFilter({
        type,
        userId,
      }),
      orderBy: {
        due: 'asc',
      },
    })
  })
}

export const markJobAsStarted = async (app: BootstrappedApp, id: number) => {
  return await app.startSpan('db.markJobAsStarted', async () => {
    return app.db.workerJob.update({
      where: {
        id,
      },
      data: {
        started: new Date(),
        updatedAt: new Date(),
      },
    })
  })
}

export const markJobAsSucceeded = async (app: BootstrappedApp, id: number, result?: object) => {
  return await app.startSpan('db.markJobAsSucceeded', async () => {
    return app.db.workerJob.update({
      where: {
        id,
      },
      data: {
        finished: new Date(),
        success: true,
        result,
        updatedAt: new Date(),
      },
    })
  })
}

export const markJobAsFailed = async (app: BootstrappedApp, id: number, result?: object) => {
  return await app.startSpan('db.markJobAsFailed', async () => {
    await app.db.workerJob.update({
      where: {
        id,
      },
      data: {
        finished: new Date(),
        success: false,
        result,
        updatedAt: new Date(),
      },
    })
  })
}

export const rescheduleFailedJob = async (app: BootstrappedApp, job: WorkerJob) => {
  return await app.startSpan('db.rescheduleFailedJob', async () => {
    await cancelPendingJobs(app, {
      type: job.type,
      userId: job.userId,
    })

    return app.db.workerJob.create({
      data: {
        ...generateJobDates(dateFrom(Date.now() + job.autoRescheduleOnFailureDelay), job.removeDelay),
        userId: job.userId,
        type: job.type,
        data: sanitizeJobData(job.data),
        cronSchedule: job.cronSchedule,
        autoRescheduleOnFailure: job.autoRescheduleOnFailure,
        autoRescheduleOnFailureDelay: job.autoRescheduleOnFailureDelay,
        removeDelay: job.removeDelay,
        rescheduledFromJob: job.id,
      },
    })
  })
}

export const rescheduleCronJob = async (app: BootstrappedApp, job: WorkerJob) => {
  return await app.startSpan('db.rescheduleCronJob', async () => {
    await cancelPendingJobs(app, {
      type: job.type,
      userId: job.userId,
    })

    return app.db.workerJob.create({
      data: {
        ...generateJobDates(parseCronExpression(job.cronSchedule!).getNextDate(new Date()), job.removeDelay),
        userId: job.userId,
        type: job.type,
        data: sanitizeJobData(job.data),
        cronSchedule: job.cronSchedule,
        autoRescheduleOnFailure: job.autoRescheduleOnFailure,
        autoRescheduleOnFailureDelay: job.autoRescheduleOnFailureDelay,
        removeDelay: job.removeDelay,
        rescheduledFromJob: job.id,
      },
    })
  })
}

export const removeOldJobs = async (app: BootstrappedApp, { exclude }: { exclude?: number[] }) => {
  return await app.startSpan('db.removeOldJobs', async () => {
    await app.db.workerJob.deleteMany({
      where: {
        removeAt: {
          lte: new Date(),
        },
        // for safety we do an additional check to make sure the job has been started
        started: {
          not: null,
        },
        id: {
          notIn: exclude || [],
        },
      },
    })
  })
}
