import { PrismaClient, WorkerJob } from '@prisma/client'
import { parseCronExpression } from 'cron-schedule'
import { ONE_HOUR, dateFrom } from '../../shared/date'
import { WorkerJobType } from '../../worker/generated/exportedTypes'
import * as Sentry from '@sentry/nextjs'

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

const cancelPendingJobs = async (db: PrismaClient, filter: any) => {
  return await Sentry.startSpan({ name: 'db.cancelPendingJobs' }, async () => {
    // update existing jobs for this user to be cancelled
    await db.workerJob.updateMany({
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

export const scheduleJob = async <T extends object>(db: PrismaClient, job: WorkerJobConfig<T>) => {
  return await Sentry.startSpan({ name: 'db.scheduleJob' }, async () => {
    await cancelPendingJobs(db, {
      type: job.type,
      userId: job.userId,
    })

    // create new job
    return await db.workerJob.create({
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

export const scheduleCronJob = async <T extends object>(db: PrismaClient, job: WorkerJobConfig<T>, cronSchedule: string) => {
  return await Sentry.startSpan({ name: 'db.scheduleCronJob' }, async () => {
    await cancelPendingJobs(db, {
      type: job.type,
      userId: job.userId,
    })

    // create new job
    return await db.workerJob.create({
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

export const getTotalPendingJobs = async (db: PrismaClient) => {
  return await Sentry.startSpan({ name: 'db.getTotalPendingJobs' }, async () => {
    return db.workerJob.count({
      where: pendingJobsQueryFilter(),
    })
  })
}

export const getNextPendingJob = async (db: PrismaClient) => {
  return await Sentry.startSpan({ name: 'db.getNextPendingJob' }, async () => {
    return db.workerJob.findFirst({
      where: pendingJobsQueryFilter(),
      orderBy: {
        due: 'asc',
      },
    })
  })
}

export const gerInProgressOrPendingJobOfTypeForUser = async (db: PrismaClient, userId: number, type: WorkerJobType) => {
  return await Sentry.startSpan({ name: 'db.gerInProgressOrPendingJobOfTypeForUser' }, async () => {
    return db.workerJob.findFirst({
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

export const markJobAsStarted = async (db: PrismaClient, id: number) => {
  return await Sentry.startSpan({ name: 'db.markJobAsStarted' }, async () => {
    return db.workerJob.update({
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

export const markJobAsSucceeded = async (db: PrismaClient, id: number, result?: object) => {
  return await Sentry.startSpan({ name: 'db.markJobAsSucceeded' }, async () => {
    return db.workerJob.update({
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

export const markJobAsFailed = async (db: PrismaClient, id: number, result?: object) => {
  return await Sentry.startSpan({ name: 'db.markJobAsFailed' }, async () => {
    await db.workerJob.update({
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

export const rescheduleFailedJob = async (db: PrismaClient, job: WorkerJob) => {
  return await Sentry.startSpan({ name: 'db.rescheduleFailedJob' }, async () => {
    await cancelPendingJobs(db, {
      type: job.type,
      userId: job.userId,
    })

    return db.workerJob.create({
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

export const rescheduleCronJob = async (db: PrismaClient, job: WorkerJob) => {
  return await Sentry.startSpan({ name: 'db.rescheduleCronJob' }, async () => {
    await cancelPendingJobs(db, {
      type: job.type,
      userId: job.userId,
    })

    return db.workerJob.create({
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

export const removeOldJobs = async (db: PrismaClient) => {
  return await Sentry.startSpan({ name: 'db.removeOldJobs' }, async () => {
    await db.workerJob.deleteMany({
      where: {
        finished: { not: null },
        success: true,
        removeAt: {
          lte: new Date(),
        },
      },
    })
  })
}
