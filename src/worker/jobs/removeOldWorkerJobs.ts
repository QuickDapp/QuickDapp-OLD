import { removeOldJobs } from '@/backend/db'
import { JobParams, JobRunner } from "../types"

export const run: JobRunner = async (params: JobParams) => {
  await removeOldJobs(params.app.db)
}
