---
order: 80
---

# build

The `build` command is responsible for:

* Building the Next.js production code.
* Building the [background worker](../background-worker/index.md) production code.

## Next.js

```shell
pnpm build web
```

The `.next/standalone/` folder will contain the output production code.

## Background worker 

```shell
pnpm build worker
```

The `build/` folder will contain the output JS code as a single file.

## Building both together

To build both the the Next.js and background worker production code together:

```shell
pnpm build
```

