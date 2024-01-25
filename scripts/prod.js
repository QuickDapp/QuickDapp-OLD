#!/usr/bin/env node

const path = require('path')

const projectRoot = path.join(__dirname, '..')
const buildRoot = path.join(projectRoot, 'build')

const webCommands = [`node ${projectRoot}/.next/standalone/server.js`]
const workerCommands = [`node ${buildRoot}/worker-bundle.js`]

require('./shared/env.js')({
  name: 'prod',
  env: 'production',
  webCommands,
  workerCommands,
  dbCommands: {
    deploy: ['Migrate the database to the latest schema', `pnpm prisma migrate deploy`],
    status: ['Check the migration status of the database', `pnpm prisma migrate status`],
  },
})
