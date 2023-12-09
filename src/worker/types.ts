import { WorkerJob } from '@prisma/client'
import { LogInterface } from '@/backend/logging'
import { BootstrappedApp } from '@/backend/bootstrap'

export interface JobParams {
  app: BootstrappedApp
  log: LogInterface
  job: WorkerJob
}

export type JobRunner = (params: JobParams) => Promise<any>

export interface Job {
  run: JobRunner,
}

export interface ChainFilterModule {
  createFilter: (chainClient: BootstrappedApp['chainClient']) => any
  processChanges: (app: BootstrappedApp, changes: any) => Promise<void>
}
