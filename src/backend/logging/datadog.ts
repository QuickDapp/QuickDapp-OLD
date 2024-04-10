import { Writable } from 'stream';
import { serverConfig } from '@/config/server';
import packageJson from '../../../package.json'
import { client, v2 } from '@datadog/datadog-api-client'

export const setupDataDogStream = () => {
  if (
    !serverConfig.DATADOG_API_KEY ||
    !serverConfig.DATADOG_APPLICATION_KEY ||
    !serverConfig.NEXT_PUBLIC_DATADOG_SITE ||
    !serverConfig.NEXT_PUBLIC_DATADOG_SERVICE
  ) {
    return
  }

  return new DataDogStream()
}

const LOG_BUFFER_MAX_SIZE = 50

const LEVELS: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
}


class DataDogStream extends Writable {
  private ddtags: string = `env:${serverConfig.NEXT_PUBLIC_APP_MODE},version:${packageJson.version}`
  private apiInstance: v2.LogsApi
  private _logs: any[] = []

  constructor() {
    super({
      objectMode: true,
    })

    const configuration = client.createConfiguration({
      // debug: true,
      authMethods: {
        apiKeyAuth: serverConfig.DATADOG_API_KEY,
        appKeyAuth: serverConfig.DATADOG_APPLICATION_KEY,
      },
    })

    configuration.setServerVariables({
      site: serverConfig.NEXT_PUBLIC_DATADOG_SITE!,
    })

    this.apiInstance = new v2.LogsApi(configuration)

    // timer to flush logs every 5 seconds
    setInterval(() => this.flush(), 5000)
  }

  async flush () {
    if (this._logs.length) {
      const logs = this._logs
      this._logs = []

      try {
        await this.apiInstance.submitLog({
          body: logs.map(l => ({
            ddsource: l.name,
            ddtags: this.ddtags,
            message: `${l.time} [${LEVELS[l.level]}] ${l.msg}`,
            service: serverConfig.NEXT_PUBLIC_DATADOG_SERVICE,
            hostname: l.hostname,
            additionalProperties: {
              level: LEVELS[l.level],
              time: l.time,
            },
          })),
          contentEncoding: 'deflate',
        })
      } catch (err) {
        console.error(`Error submitting logs to DataDog`, err)        
      }
    }
  }

  _write(log: any, enc: any, cb: any) {
    this._logs.push(JSON.parse(log))
    if (this._logs.length >= LOG_BUFFER_MAX_SIZE) {
      this.flush()
    }
    cb()
  }
}