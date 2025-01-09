---
icon: cpu
order: 95
expanded: true
---

# Backend architecture

The web backend is built on Next.js, a serverless Node.js framework for serving up React.js apps with server-side rendering and static page generation enabled.

Prisma is integrated as an ORM layer for accessing a persistent [database](database.md) (PostgreSQL by default).

A GraphQL API layer allows for the frontend (and indeed, any third-party client) to read from and write to the backend.

Configuration parameters are supplied via server-side-only [environment variables](../environment-variables.md).

A hierarchical [logging system](../logging/index.md) allows for categorised logging output with differing log level thresholds.



