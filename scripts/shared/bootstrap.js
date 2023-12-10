const { Command } = require('commander')

const parseCommands = async (comm, cmds) => {
  Object.keys(cmds).forEach(k => {
    let { desc, args, opts, action, sub } = cmds[k]

    const c = new Command(k).description(desc)
    
    if (args) {
      args.forEach(a => {
        c.argument(a[0], a[1])
      })
    }
    
    if (action) {
      c.action(action)
    }

    if (opts) {
      opts.forEach(o => {
        const [flags, description, defaultValue] = o
        c.option(flags, description, defaultValue)
      })
    }

    if (sub) {
      parseCommands(c, sub)
    }

    comm.addCommand(c, k === 'default' ? { hidden: true, isDefault: true } : {})
  })
}

const execCommands = async (cliName, cmds) => {
  const cli = new Command().name(cliName)
  parseCommands(cli, cmds)
  await cli.parseAsync(process.argv)
}

const logInfoBlock = async (msg) => {
  const { default: chalk } = await import('chalk')
  const lines = ["", ...msg.split("\n"), ""]
  const maxLength = lines.reduce((a, b) => Math.max(a, b.length), 0) + 8
  const paddedLines = lines.map(l => {
    return l.padStart(l.length + 4, " ").padEnd(maxLength, " ")
  })
  const paddedMsg = paddedLines.join("\n")
  console.log(chalk.bgYellowBright.black(paddedMsg))
}


module.exports = async (env) => {
  try {
    const path = require('path')
    const { $ } = await import('execa')
    
    const dotenv = require('dotenv')
    const envObj = {}
    env = process.env.NODE_ENV || env
    process.env.NODE_ENV = env
    dotenv.configDotenv({ path: path.join(__dirname, '..', '..', `.env`), override: true, processEnv: envObj })
    dotenv.configDotenv({ path: path.join(__dirname, '..', '..', `.env.${env}`), override: true, processEnv: envObj })
    dotenv.configDotenv({ path: path.join(__dirname, '..', '..', `.env.local`), override: true, processEnv: envObj })
    process.env = { ...envObj, ...process.env }

    const rootFolder = path.join(__dirname, '..', '..')

    const get$$ = (folder) => {
      return $({
        cwd: folder,
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
        },
      })
    }

    const $$ = get$$(rootFolder)

    const runShellScripts = async scripts => {
      await Promise.all(
        scripts.map(c => {
          return $$`${c}`
        })
      )
    }    

    return { rootFolder, $$, get$$, execCommands, runShellScripts, logInfoBlock }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
