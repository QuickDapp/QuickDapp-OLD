#!/usr/bin/env node

;(async () => {
  try {
    const path = require('path')
    
    const { $$, execCommands, rootFolder } = await require('./shared/bootstrap')()

    const dockerFile = path.join(rootFolder, 'Dockerfile')

    await execCommands('docker', {
      build: {
        desc: 'Build docker images',
        sub: {
          '(default)': {
            desc: 'Build combined web + worker docker image',
            opts: [['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp']],
            action: async ({ prefix }) => {
              prefix = prefix.toLowerCase()
              await $$`docker build --file ${dockerFile} --target all --tag ${prefix}-all ${rootFolder}`
            },
          },
          web: {
            desc: 'Build web docker image',
            opts: [['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp']],
            action: async ({ prefix }) => {
              prefix = prefix.toLowerCase()
              await $$`docker build --file ${dockerFile} --target web --tag ${prefix}-web ${rootFolder}`
            },
          },
          worker: {
            desc: 'Build worker docker image',
            opts: [['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp']],
            action: async ({ prefix }) => {
              prefix = prefix.toLowerCase()
              await $$`docker build --file ${dockerFile} --target worker --tag ${prefix}-worker ${rootFolder}`
            },
          },
        },
      },
      run: {
        desc: 'Run docker images',
        sub: {
          '(default)': {
            desc: 'Run combined web + worker docker image',
            opts: [
              ['-p, --port <port>', 'Host port to connect to the exposed container port', '3000'],
              ['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp'],
              ['-t, --term', 'Run in terminal mode', false],
            ],
            action: async ({ prefix, port, term }) => {
              prefix = prefix.toLowerCase()
              await $$`docker run ${term ? '-it --entrypoint /bin/sh': ''} -p ${port}:8080 --rm --name ${prefix}-all ${prefix}-all`
            },
          },
          web: {
            desc: 'Run web docker image',
            opts: [
              ['-p, --port <port>', 'Host port to connect to the exposed container port', '3000'],
              ['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp'],
              ['-t, --term', 'Run in terminal mode', false],
            ],
            action: async ({ prefix, port, term }) => {
              prefix = prefix.toLowerCase()
              await $$`docker run ${term ? '-it --entrypoint /bin/sh' : ''} -p ${port}:8080 --rm --name ${prefix}-web ${prefix}-web`
            },
          },
          worker: {
            desc: 'Run worker docker image',
            opts: [
              ['-p --prefix <prefix>', 'Docker image name prefix', 'quickdapp'],
              ['-t, --term', 'Run in terminal mode', false],
            ],
            action: async ({ prefix, term }) => {
              prefix = prefix.toLowerCase()
              await $$`docker run ${term ? '-it --entrypoint /bin/sh' : ''} --rm --name ${prefix}-worker ${prefix}-worker`
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
