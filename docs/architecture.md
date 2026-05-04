# HIS Architecture

## Modular Monolith First

The API is organized by clinical capability so teams can later extract services without rewriting business logic:

- Auth and RBAC
- Patient management
- Scheduling
- EMR
- Billing
- Inventory
- Laboratory
- Telemedicine
- Reporting and analytics

This keeps deployment simple early while preserving service boundaries for growth.

## Compliance Controls

- Store only necessary PHI and encrypt sensitive clinical notes/history.
- Use TLS at the ingress layer and private networking between services.
- Issue short-lived JWTs and rotate signing secrets.
- Keep audit logs immutable in production storage.
- Restrict database roles per service and environment.
- Back up PostgreSQL with tested point-in-time recovery.

## External Integration

Use integration adapters for FHIR/EHR, HL7 lab feeds, payment gateways, and insurance clearinghouses. Keep adapters behind module interfaces so vendor-specific behavior does not leak into clinical workflows.

## Performance

- Add PostgreSQL indexes around MRN, patient names, doctor schedules, and audit timelines.
- Use Redis for appointment availability caching, dashboard summary caching, WebSocket fanout, and distributed rate limiting.
- Use read replicas for reporting workloads.
- Move event-heavy tasks such as reminders and claim submission to a queue.

## Fault Tolerance

- Run API instances behind a load balancer.
- Use managed PostgreSQL with PITR and multi-AZ replicas.
- Deploy ML independently so clinical workflows degrade gracefully if predictions are unavailable.
- Use idempotency keys for billing, insurance, lab order, and reminder workflows.
