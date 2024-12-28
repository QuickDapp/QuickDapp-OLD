export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { register } = await import('./src/instrumentation.node')
    await register(process.env.OTEL_SERVICE_NAME)
  }
}