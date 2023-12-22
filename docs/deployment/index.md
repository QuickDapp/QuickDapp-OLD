---
icon: container
order: 80
expanded: true
---

# Deployment

QuickDapp deployment consists of deploying both:

* Next.js app
* [Background worker](../worker/index.md) process

You will most likely want to deploy the dapp to [Vercel](https://vercel.com/) or an equivalent serverless environment for maximum scalability. 

However, QuickDapp has built-in support for building [Docker images](./docker.md) of the dapp in order to deploy it to hosted container environments. The background worker process must be built as a docker image.