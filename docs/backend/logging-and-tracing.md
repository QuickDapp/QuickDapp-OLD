---
order: 90
---

# Logging and tracing

The backend logging system is built on [bunyan](https://www.npmjs.com/package/bunyan) and is designed for categorised, hierarchical logging with log thresholds.

Each log treshold has a corresponding method with the same name available on a logger instance. The possible log thresholds are:

* `trace` - _for very low-level messages that you normally don't need to see._
* `debug` - _for messages that can help with debugging issues._
* `info` - _for general messages that you want to see in the logs in production._
* `warn` - _for minor issues that don't cause problems but may need investigating._
* `error` - _for problems and errors that need to be investigated and/or fixed._

For example, to create a logger which logs to console:

```ts
import { createLog } from '@/backend/logging'

const log = createLog({
  name: 'root',
  logLevel: 'debug'
})

// will output nothing since minimum log level is "debug"
log.trace('test') 

// will output: 19:36:13.090Z  DEBUG root: test
log.debug('test') 
```

Now a child logger can be created from the `root` logger:

```ts
const child = log.create('sub')

// will output: 19:36:14.090Z  DEBUG root/sub: test2
child.debug('test2')
```

!!!
There is always an instantiated `log` property in the [bootstrapped object](./bootstrap.md).
!!!

## OpenTelemetry

QuickDapp has built-in support for [OpenTelemetry](https://opentelemetry.io/) tracing and logging. Tracing is the process of measuring how long requests take to complete, including method calls made within. A typical trace may look something like this:

![An example OpenTelemtry trace](/static/trace.png)

To enable tracing the following [environment variables](../environment-variables.md) need to be set:

* `OTEL_SERVICE_NAME` - tracing and logging for the main web app
* `OTEL_WORKER_SERVICE_NAME` - tracing and logging for the [worker](../worker) app, we recommend using a different name for this so that you can distinguish between your main and worker apps.

By default this will send all logs and traces to a local endpoint, if it exists. To view these traces we recommend running the [OpenTelemetry default viewer](https://github.com/vercel/opentelemetry-collector-dev-setup) - you will be view everything at http://localhost:16686/.

At present the default viewer will only show traces and not log messages. However, you will always still be able to see log messages in the terminal/console.

## Cloud provider

We highly recommend using a provider such as [Honeycomb](https://honeycomb.io) as the OpenTelemetry endpoint. Honeycomb can not only collect traces, but also log messages, giving you one unified view of all logging and tracing output.

To get Honeycomb (or any other OpenTelemetry cloud provider working) working you will need to set the following additional environment variables:

* `OTEL_EXPORTER_OTLP_ENDPOINT` - the ingestion point, e.g `https://api.honeycomb.io:443`
* `OTEL_EXPORTER_OTLP_HEADERS` - additional headers to send, usually where authentication sits, e.g: `x-honeycomb-team=<your honeycomb auth key>` 

Additionally, the `OTEL_EXPORTER_OTLP_PROTOCOL` can be used to customize the protocol OpenTelemetry uses to communicate with the endpoint, though for most 
cases the default value - `http/protobuf` - should suffice.


