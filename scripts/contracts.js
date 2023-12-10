#!/usr/bin/env node

;(async () => {
  try {
    const path = require('path')
    const fs = require('fs')
    const { setTimeout } = require('node:timers/promises')
    const { get$$, $$, execCommands, rootFolder, logInfoBlock } = await require('./shared/bootstrap')('production')

    const contractsFolder = path.join(rootFolder, 'contracts')

    const contracts$$ = get$$(contractsFolder)

    await execCommands('contracts', {
      init: {
        desc: 'Initialize the contracts submodule dependency',
        action: async () => {
          await $$`git submodule update --init --recursive`
          await contracts$$`pnpm install`
          await contracts$$`pnpm setup`
        },
      },
      dev: {
        desc: 'Start a local anvil node and deploy the contracts to it, monitoring for changes and redeploying as necessary.',
        action: async () => {
          await Promise.all([
            contracts$$`pnpm devnet`,
            (async () => {
              await setTimeout(1000)
              await contracts$$`pnpm build`
              await contracts$$`pnpm dep local -n`
              // get proxy contract address from deployments file
              const { local } = JSON.parse(fs.readFileSync(path.join(contractsFolder, 'gemforge.deployments.json'), 'utf8'))
              const { address } = local.contracts.find(a => a.name === 'DiamondProxy').onChain
              await logInfoBlock(`Enter the following line into your .env.development or .env.local file:

NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS="${address}"`)
            })()
          ])
        },
      },
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
