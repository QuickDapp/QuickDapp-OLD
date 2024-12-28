import { logs, NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan'

export async function register(projectName?: string) {
  if (projectName) {
    const sdk = new NodeSDK({
      serviceName: projectName,
      instrumentations: [getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },    
      }), new BunyanInstrumentation()],
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
      logRecordProcessor: new logs.SimpleLogRecordProcessor(new OTLPLogExporter()),
    })
  
    process.on('SIGTERM', () =>
        sdk
            .shutdown()
            .then(
                () => console.log('OTEL SDK shut down successfully'),
                (err) => console.log('Error shutting down OTEL SDK', err)
            )
            .finally(() => process.exit(0))
    );
  
    sdk.start()
  }
}
