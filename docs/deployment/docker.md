---
order: 100
---

# Docker images

The [`docker` command](../command-line/docker.md) is used to build Docker images. By default, 3 types of images are supported:

* `web` - Next.js app server. (_Exposes the app on port 3000_).
* `worker` - Background worker server.
* `all` - Next.js app server + background worker server combined. (_Exposes the Next.js app on port 3000_).

The images internally bundle the QuickDapp CLI so that the actual entrypoint for each image is the [`prod` command](../command-line/prod.md). This means the servers are spawned as child processes of the main process. If any server crashes then the main process (and thus the Docker container) will also crash and exit.

Images are based on Alpine Linux and are built to hold only the minimal required dependencies to run the servers. Thus, even the `all` image comes to <500 MB in size. 

To make this possible, Webpack is used to build the background worker process to a single file. For the Next.js app the [`standalone` option](https://nextjs.org/docs/pages/api-reference/next-config-js/output) is enabled in the config.

## Deployment

One built the images can be [run locally](../command-line/docker.md) and/or deployed to any Docker container hosting environment of your choice. 

At present, QuickDapp provides built-in support for [deploying to DigitalOcean](./digital-ocean.md).

