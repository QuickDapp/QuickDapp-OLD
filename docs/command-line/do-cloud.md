---
order: 50
---

# do-cloud

The `do-cloud` command is responsible for interacting with the [DigitalOcean](https://www.digitalocean.com/) API. Specifically it enables the following:

* Provision a managed PostgreSQL database and associated user.
* Push [Docker](../deployment/docker.md) images to a managed container registry.

All of these commands require the following environment variable to be set in either `.env.production` or `.env.local`:

* `DIGITALOCEAN_ACCESS_TOKEN` - set this to a DigitalOcean [personal access token](https://docs.digitalocean.com/reference/api/create-personal-access-token/).

## Database provisining

```shell
pnpm do-cloud db setup
```

This will setup a managed PostgreSQL database, creating a basic db cluster if it doesn't already exist.

If existing clusters are found then it will ask you to select the cluster within which to create the database.

It will then create a PostgreSQL user that is able to access and modify the newly created database.

The default database name and username are both `quickdapp`. To customize:

```shell
pnpm do-cloud db setup --name <db_name> --user <username>
```

The final output of the command will be the database connection string to set as the `DATABASE_URL` [environment variable](../environment-variables.md), e.g:

```
postgres://quickdapp:somepassword@db-postgresql-lon1-05437-do-user-321011-1.db.ondigitalocean.com:25060/quickdapp?schema=public
```

## Docker images

```shell
# push Next.js docker image
pnpm do-cloud docker push web
# push Worker docker image
pnpm do-cloud docker push worker
# push combined Next.js + Worker docker image
pnpm do-cloud docker push
```

This will first create a Docker [container registry](https://docs.digitalocean.com/products/container-registry/) if it doesn't already exist. 

!!!
If a registry needs to be created then the most basic type of registry will be created. At the time of writing (Dec 2024) this can only hold a single Docker image. If you wish to push multiple images to it then you will need to upgrade it manually via the DigitalOcean dashboard.
!!!

By default the created registry is called `quickdapp`. To customize the name:

```shell
pnpm do-cloud docker push web --registry myregistry
```

If the `myregistry` registry already exists then it will be used, otherwise it will be created.

Once the registry has been created the specified Docker image will be pushed to it. Note that the [Docker tag](https://docs.docker.com/engine/reference/commandline/tag/) is always set to `latest`.

If you had used a custom docker image name prefix when [building the images](./docker.md) then you will need to supply that prefix here too, e.g:

```shell
pnpm do-cloud docker push --prefix myapp
```