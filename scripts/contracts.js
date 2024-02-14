#!/usr/bin/env node

;(async () => {
  try {
    const path = require('path')
    const fs = require('fs')
    const { get$$, $$, execCommands, rootFolder, logInfoBlock } = await require('./shared/bootstrap')('development')

    const contractsFolder = path.join(rootFolder, 'contracts')

    const contracts$$ = get$$(contractsFolder)

    await execCommands('contracts', {
      bootstrap: {
        desc: 'Initialize the contracts submodule dependency',
        action: async () => {
          await contracts$$`pnpm install`
          await contracts$$`pnpm bootstrap`
        },
      },
      'build-and-upgrade': {
        desc: 'Build contracts and upgrade the deployed instance on the local Anvil node',
        action: async () => {
          await contracts$$`pnpm build`
          await contracts$$`pnpm dep local`
        },
      },
      dev: {
        desc: 'Build contracts and upgrade the deployed instance on the local Anvil node (this gets auto-called by the dev command)',
        action: async () => {
          await Promise.all([
            contracts$$`pnpm devnet`,
            (async () => {
              await contracts$$`pnpm build`
              await contracts$$`pnpm dep local -n`
              // get proxy contract address from deployments file
              const { local } = JSON.parse(
                fs.readFileSync(path.join(contractsFolder, 'gemforge.deployments.json'), 'utf8')
              )
              const { address } = local.contracts.find(a => a.name === 'DiamondProxy').onChain
              await logInfoBlock(`Enter the following line into your .env.development or .env.local file:

NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS="${address}"`)

              await $$`pnpm nodemon --on-change-only --watch ./contracts/src/facets ./contracts/src/facades ./contracts/src/init ./contracts/src/interfaces ./contracts/src/libs ./contracts/src/shared --ext sol --exec "./scripts/contracts.js build-and-upgrade"`
            })(),
          ])
        },
      },
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
