#!/usr/bin/env node

;(async () => {
  try {
    const { $$, execCommands } = await require('./shared/bootstrap')('production')

    const _buildWeb = async () => {
      console.log('Building Next.js app...')
      await $$`pnpm next build`
      await $$`cp -r public .next/standalone`
      await $$`cp -r .next/static .next/standalone/.next/static`
    }

    const _buildWorker = async () => {
      console.log('Building Worker app...')
      await $$`pnpm webpack -c src/worker/webpack.config.js`
    }

    await execCommands('build', {
      '(default)': {
        desc: 'Build the web and worker apps',
        action: async () => {
          await Promise.all([_buildWeb(), _buildWorker()])
        },
      },
      web: {
        desc: 'Build the web app',
        action: _buildWeb,
      },
      worker: {
        desc: 'Build the worker app',
        action: _buildWorker,
      }
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
