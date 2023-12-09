#!/usr/bin/env node

;(async () => {
  try {
    const { $$, execCommands } = await require('./shared/bootstrap')()
    const { pushDockerImageToContainerRegistry, createDatabase } = await require('./shared/digitalocean')

    await execCommands('do-cloud', {
      db: {
        desc: 'Manage DigitalOcean databases',
        sub: {
          setup: {
            desc: 'Setup a Postgres database',
            opts: [
              ['-n, --name <name>', 'Database name', 'quickdapp'],
              ['-u. --user <username>', 'Database username', 'quickdapp'],
            ],
            action: async ({ name, user }) => {
              await createDatabase(name, user)
            },
          },
        },
      },
      docker: {
        desc: 'Manage DigtalOcean docker images',
        sub: {
          push: {
            desc: 'Push docker images to a container registry',
            sub: {
              default: {
                desc: 'Push combined web + worker Docker image',
                opts: [
                  ['-r, --registry <id>', 'Docker container registry name', 'quickdapp'],
                  ['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp'],
                ],
                action: async ({ prefix, registry }) => {
                  await pushDockerImageToContainerRegistry($$, registry, `${prefix}-all`)
                },
              },
              web: {
                desc: 'Push web Docker image',
                opts: [
                  ['-r, --registry <id>', 'Docker container registry name', 'quickdapp'],
                  ['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp'],
                ],
                action: async ({ prefix, registry }) => {
                  await pushDockerImageToContainerRegistry($$, registry, `${prefix}-web`)
                },
              },
              worker: {
                desc: 'Push worker Docker image',
                opts: [
                  ['-r, --registry <id>', 'Docker container registry name', 'quickdapp'],
                  ['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp'],
                ],
                action: async ({ prefix, registry }) => {
                  await pushDockerImageToContainerRegistry($$, registry, `${prefix}-worker`)
                },
              },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
