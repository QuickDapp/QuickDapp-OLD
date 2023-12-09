import bunyan from 'bunyan'
import bformat from 'bunyan-format'

import type { LoggerMethods } from './types'
import { setupDataDogStream } from './datadog'

const formattedOutput = bformat({
  outputMode: 'short',
  color: true,
})

export interface LogConfig {
  name?: string
  logLevel: string,
}

export interface LogInterface extends LoggerMethods {
  create: (name: string) => LogInterface
  flush: () => Promise<void>
}

class Log {
  private _opts: any
  private _name: string
  private _log: bunyan

  constructor(opts: any) {
    this._opts = opts
    this._name = opts.name
    this._log = bunyan.createLogger(opts)
    ;['trace', 'debug', 'info', 'warn', 'error'].forEach(fn => {
      ;(this as any)[fn] = (...args: any[]) => {
        const obj: any = {}

        // an error object should get passed through specially
        obj.err = args.find(a => a.stack && a.message)
        ;(this._log as any)[fn].apply(this._log, [obj, ...args])
      }
    })
  }

  throw(msg: string) {
    (this as any).error(msg)
    throw new Error(msg)
  }

  create(name: string): LogInterface {
    return new Log({
      ...this._opts,
      name: `${this._name}/${name}`,
    }) as any
  }

  async flush() {
    return Promise.all(
      this._opts.streams.map((s: any) => {
        if (s.stream && s.stream.flush) {
          return s.stream.flush()
        }
      })
    )
  }
}

export const createLog = (config: LogConfig): LogInterface => {
  const streams: any[] = []

  streams.push(
    {
      level: config.logLevel,
      stream: formattedOutput,
    },
  )

  const dataDogStream = setupDataDogStream()
  if (dataDogStream) {
    streams.push({
      level: config.logLevel,
      stream: dataDogStream,
    })
  }

  return new Log({
    name: config.name || 'root',
    streams,
    serializers: {
      err: bunyan.stdSerializers.err,
    },
  }) as any
}
