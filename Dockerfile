################################################################################
#
# Base
#
################################################################################

FROM --platform=linux/amd64 node:20-alpine3.21 AS base
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


################################################################################
#
# Build base
#
################################################################################

# Install dependencies only when needed
FROM base AS build_base

# From https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
ENV PYTHONUNBUFFERED=1

# From https://github.com/chrisa/node-dtrace-provider?tab=readme-ov-file#troubleshooting-build-issues
ENV NODE_DTRACE_PROVIDER_REQUIRE=hard

RUN apk add --update --no-cache libc6-compat python3 make g++ bash git
RUN ln -sf python3 /usr/bin/python

# Install dependencies based on the preferred package manager
WORKDIR /app
COPY . .

# prepare
RUN yarn global add pnpm
RUN pnpm i --frozen-lockfile
RUN pnpm bootstrap


################################################################################
#
# Web
#
################################################################################

FROM build_base as build_base_web
WORKDIR /app
ENV NODE_ENV production
ENV SHELL /bin/bash
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build web

FROM base AS web
WORKDIR /app

ENV NODE_ENV production
ENV SHELL /bin/bash
ENV NEXT_TELEMETRY_DISABLED 1 

RUN yarn global add pnpm
# for scripts to work
RUN pnpm add dotenv commander execa

COPY --from=build_base /app/package.json ./package.json
COPY --from=build_base /app/.env ./.env
COPY --from=build_base /app/.env.production ./.env.production
COPY --from=build_base /app/scripts ./scripts

RUN mkdir -p ./node_modules
COPY --from=build_base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build_base /app/node_modules/prisma ./node_modules/prisma
COPY --from=build_base /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p ./.next
COPY --from=build_base_web --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone

USER nextjs
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"
ENV NEXTAUTH_URL "http://0.0.0.0:8080"
ENTRYPOINT [ "/usr/local/bin/pnpm" ]
CMD ["prod", "web"]

################################################################################
#
# Worker
#
################################################################################

FROM build_base as build_base_worker
WORKDIR /app
ENV NODE_ENV production
ENV SHELL /bin/bash
ENV NEXT_TELEMETRY_DISABLED 1 
RUN pnpm build worker

FROM base AS worker
WORKDIR /app

ENV NODE_ENV production
ENV SHELL /bin/bash
ENV NEXT_TELEMETRY_DISABLED 1 
RUN yarn global add pnpm
# for scripts to work
RUN pnpm add dotenv commander execa

COPY --from=build_base /app/package.json ./package.json
COPY --from=build_base /app/.env ./.env
COPY --from=build_base /app/.env.production ./.env.production
COPY --from=build_base /app/scripts ./scripts

RUN mkdir -p ./node_modules
COPY --from=build_base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build_base /app/node_modules/prisma ./node_modules/prisma
COPY --from=build_base /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=build_base_worker --chown=nextjs:nodejs /app/build ./build

USER nextjs
ENTRYPOINT [ "/usr/local/bin/pnpm" ]
CMD ["prod", "worker"]

################################################################################
#
# Combined: worker + web
#
################################################################################

FROM build_base as build_base_all
WORKDIR /app
ENV NODE_ENV production
ENV SHELL /bin/bash
ENV NEXT_TELEMETRY_DISABLED 1 
RUN pnpm build

FROM base AS all
WORKDIR /app

ENV NODE_ENV production
ENV SHELL /bin/bash
ENV NEXT_TELEMETRY_DISABLED 1 

RUN yarn global add pnpm
# for scripts to work
RUN pnpm add dotenv commander execa

COPY --from=build_base /app/package.json ./package.json
COPY --from=build_base /app/.env ./.env
COPY --from=build_base /app/.env.production ./.env.production
COPY --from=build_base /app/scripts ./scripts

RUN mkdir -p ./node_modules
COPY --from=build_base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build_base /app/node_modules/prisma ./node_modules/prisma
COPY --from=build_base /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p ./.next
COPY --from=build_base_all --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone
COPY --from=build_base_all --chown=nextjs:nodejs /app/build ./build

USER nextjs
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"
ENV NEXTAUTH_URL "http://0.0.0.0:8080"
ENTRYPOINT [ "/usr/local/bin/pnpm" ]
CMD ["prod"]
