import { LogInterface } from "@/backend/logging"
import { chainFilters } from '../generated/mappings'
import { ChainFilterModule, JobParams, JobRunner } from "../types"

interface FilterModule {
  chainFilter: ChainFilterModule,
  filter: any
  log: LogInterface
}

const filters: Record<string, FilterModule> = {}

let filtersCreated = false

const recreateFilters = async ({ app, log }: JobParams) => {
  log.info(`Creating filters`)

  for (const f in chainFilters) {
    filters[f] = {
      log: log.create(f),
      chainFilter: chainFilters[f],
      filter: await chainFilters[f].createFilter(app.chainClient),
    }
    log.debug(`Created filter: ${f}`)
  }

  filtersCreated = true
  log.info(`Created filters`)
}

export const run: JobRunner = async (params: JobParams) => {
  const { app, log } = params

  if (!filtersCreated) {
    await recreateFilters(params)
  }

  const { chainClient } = app

  await Promise.all(Object.keys(filters).map(async f => { 
    const fm = filters[f]
    try {
      const changes = await chainClient.getFilterChanges({ filter: fm.filter })

      if (changes.length) {
        log.debug(`Found new events for filter: ${f}`)

        await filters[f].chainFilter.processChanges(
          {
            ...app,
            log: fm.log,
          },
          changes
        )
      }
    } catch (err) {
      fm.log.error(`Error processing filter: ${err}`)
      // sometimes filter fails because the node cluster has replaced the node
      fm.log.info(`>>> Recreating filters...`);
      await recreateFilters(params)
    }
  }))
}


