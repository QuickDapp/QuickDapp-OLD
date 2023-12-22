---
order: 70
---

# Deploying to DigitalOcean

The [`do-cloud` command](../command-line/do-cloud.md) makes it easy to deploy built [Docker images](./docker.md) to your DigitalOcean docker [container registry](https://www.digitalocean.com/products/container-registry). If a registry doesn't yet exist it will be created. 

To actually deploy and run your application you will need to [create an App](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-container-images/) in the DigitalOcean dashboard, pointing it your container registry and Docker image.

This way, every time a new version of the Docker image is pushed to the registry, the live app will be automatically updated to use this image. At this point you will have something akin to _"Continuous Deployment"_ setup.

## Database setup

You can also use the `do-cloud` command to setup a PostgreSQL database in DigitalOcean for your live app to use. For maximum communication efficiency ensure that both the App and database are located in the same regional datacenter.