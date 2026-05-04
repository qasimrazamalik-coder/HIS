# Enterprise Deployment Guide

## Runtime Topology

The platform is structured as independently scalable services:

- `his-web`: React clinical workspace
- `his-api`: REST, GraphQL, RBAC, audit, WebSockets, enterprise contracts
- `ml`: predictive analytics service
- PostgreSQL: transactional clinical store with point-in-time recovery
- Redis: cache, distributed rate limiting, and WebSocket fanout boundary

## Kubernetes

The baseline Kubernetes manifest is in [his-platform.yaml](../infra/k8s/his-platform.yaml).

Recommended production additions:

- Managed PostgreSQL with multi-AZ replication and PITR
- Managed Redis with TLS and private networking
- External secrets manager for `JWT_SECRET`, database credentials, encryption keys, and OAuth secrets
- NGINX or cloud ingress with TLS 1.2+ and WebSocket support
- Pod disruption budgets for API and web deployments
- Blue/green or rolling migrations with backward-compatible schema changes

## Zero-Downtime Migrations

Use expand-and-contract migrations:

1. Add nullable columns, indexes, and new tables.
2. Deploy code that writes both old and new structures where needed.
3. Backfill asynchronously.
4. Switch reads to the new shape.
5. Remove deprecated columns only after all old deployments are gone.

## Quality Gates

Local gates:

```bash
npm run build
npm test
npm run test:e2e -w apps/web
npm audit --audit-level=moderate
```

Optional smoke load test:

```bash
k6 run tests/load/k6-smoke.js
```

