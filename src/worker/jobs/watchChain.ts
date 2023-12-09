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

export const run: JobRunner = async ({ app, log }: JobParams) => {
  if (!filtersCreated) {
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
    }
  }))
}


