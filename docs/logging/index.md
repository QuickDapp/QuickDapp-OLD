---
icon: container
order: 81
expanded: true
---

# Logging

The QuickDapp backend has built-in console logging via [bunyan](https://www.npmjs.com/package/bunyan) and is designed for categorised, hierarchical logging with log thresholds.

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
There is always an instantiated `log` property in the [bootstrapped object](../backend/bootstrap.md).
!!!

