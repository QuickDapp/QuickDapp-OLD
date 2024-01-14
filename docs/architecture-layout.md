---
order: 99
---

# Architecture

QuickDapp is built on Next.js. Thus, if you can build Next.js apps then you can build a QuickDapp. In addition to this, it also provides a [background worker](./worker/index.md) Node process as well as various [command-line tools](./command-line/index.md) for running and deploying the dapp and worker servers.

## File-system layout

_Note: This is not intended to be an exhaustive list of all the files in repository, but should give you a good idea of where things are._

```shell
.env                      # Default environment variable values
.env.development          # Development environment environment variable overrides 
.env.production           # Production environment environment variable overrides 
.env.local                # Further local environment overrides (overrides .env.* files)

Dockerfile                # Docker build instructions

postcss.config.js         # PostCSS config
tailwind.config.js        # TailwindCSS config
next.config.js            # Next.js config
tsconfig.json             # Typescript config
components.json           # @shadcn/ui config

docs/                     # This documentation
pages/                    # Next.js Page router API, see https://nextjs.org/docs/pages/building-your-application/routing/api-routes
public/                   # Next.js static files - favicon, app icon, web manifest
scripts/                  # Command-line scripts
src/                      
    app/                  # Next.js App router, see https://nextjs.org/docs/app
    config/               # Environment variables configuration
    backend/              # Back-end (server-side) code, including database, logging, GraphQL server-side resolvers, etc.
    frontend/             # Front-end code, including GraphQL schema, reusable React hooks, contexts, components, etc.
    shared/               # Utility code shared between front-end and back-end
    worker/               # Background worker process code
```