#!/usr/bin/env node

module.exports = async ({ env, name, webCommands, workerCommands, dbCommands }) => {
  try {
    const { $$, execCommands, runShellScripts } = await require('./bootstrap')(env)

    await execCommands(name, {
      default: {
        desc: 'Run all servers',
        action: async () => {
          await runShellScripts([...webCommands, ...workerCommands])
        },
      },
      web: {
        desc: 'Run web server',
        action: async () => {
          await runShellScripts(webCommands)
        },
      },
      worker: {
        desc: 'Run worker server',
        action: async () => {
          await runShellScripts(workerCommands)
        },
      },
      db: {
        desc: 'Run database commands',
        sub: {
          ...Object.entries(dbCommands).reduce((acc, [key, [desc, command]]) => {
            acc[key] = {
              desc,
              action: async () => {
                await $$`${command}`
              },
            }
            return acc
          }, {})
        },
      },
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

