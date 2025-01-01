import { serverConfig } from "@/config/server";

// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

if (serverConfig.SENTRY_WORKER_DSN) {
  Sentry.init({
    dsn: serverConfig.SENTRY_WORKER_DSN,
    environment: serverConfig.NEXT_PUBLIC_APP_MODE,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
  });

  process.on('unhandledRejection', (error) => {
    Sentry.captureException(error);
  });

  process.on('uncaughtException', (error) => {
    Sentry.captureException(error);
  });
}
