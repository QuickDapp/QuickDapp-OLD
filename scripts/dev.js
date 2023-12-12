#!/usr/bin/env node

const webCommands = [
  `pnpm next dev`,
  `pnpm nodemon --watch src/shared/graphql --ext js,ts,json --exec "graphql-code-generator --config ./src/shared/graphql/codegen.ts"`,
]

const workerCommands = [
  `pnpm nodemon --watch src --ext js,ts,json --exec "ts-node -P src/worker/tsconfig.json -r tsconfig-paths/register src/worker/index.ts"`,
  `pnpm nodemon --watch src/worker/jobs --ignore src/worker/generated --ext js,ts,json --exec "./src/worker/codegen.js"`,
]

require('./shared/env.js')({
  name: 'dev',
  env: 'development',
  webCommands,
  workerCommands,
  dbCommands: {
    'generate-types': ['Generate typescript types', `prisma generate`],
    migrate: ['Migrate the database to the latest schema', `pnpm prisma migrate dev`],
    reset: ['Reset the database to an empty state', `pnpm prisma migrate reset --force`],
  },
})
