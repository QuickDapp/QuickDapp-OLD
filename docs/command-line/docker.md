---
order: 60
---

# docker

The `docker` command is responsible for:

* Building and running Next.js production Docker images.
* Building and running [background worker](../worker/index.md) production Docker images.

All of these commands operate using the **production** environment configuration as defined via the [environment variables](../environment-variables.md).

## Next.js

```shell
pnpm docker build web
```

To run this image:

```shell
pnpm docker run web
```

The built image will be named `quickdapp-web` - this can be customized using the `--prefix` option. Example:

```shell
# Build with custom prefix: myapp
pnpm docker build web --prefix myapp   
# Run the image
pnpm docker run web --prefix myapp   
```


## Background worker

```shell
pnpm docker build worker
```

To run this image:

```shell
pnpm docker run worker
```

The built image will be named `quickdapp-worker` - this can be customized using the `--prefix` option. Example:

```shell
# Build with custom prefix: myapp
pnpm docker build worker --prefix myapp   
# Run the image
pnpm docker run worker --prefix myapp
```

## Combined Next.js + worker

```shell
pnpm docker build
```

To run this image:

```shell
pnpm docker run
```

The built image will be named `quickdapp-all` - this can be customized using the `--prefix` option. Example:

```shell
# Build with custom prefix: myapp
pnpm docker build --prefix myapp   
# Run the image
pnpm docker run --prefix myapp
```

## Terminal mode

To run any of the Docker images in terminal mode so that you can browse within the container using a shell, append the `--term` option, e.g:

```shell
pnpm docker run web --term
```