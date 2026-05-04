# Hospital Information System

A scalable Hospital Information System scaffold with a TypeScript REST API, React UI, PostgreSQL persistence, WebSocket alerts, RBAC, audit logging, encrypted sensitive fields, and an isolated ML prediction service.

## Stack

- Backend: Node.js, TypeScript, Express, Prisma, Socket.IO
- Frontend: React, Vite, TypeScript
- Database: PostgreSQL
- Auth: JWT with OAuth2-ready provider boundary
- ML service: Python FastAPI placeholder service for readmission/outcome risk scoring
- Infra: Docker Compose, GitHub Actions CI

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

The API listens on `http://localhost:4000`, the UI on `http://localhost:5173`, PostgreSQL on `localhost:5432`, and the ML service on `http://localhost:8000`.

## Security And Compliance Notes

This project includes security controls that are expected in a HIPAA-aligned engineering baseline: access control, audit trails, encrypted PHI fields, TLS-ready deployment boundaries, request hardening, rate limiting, and least-privilege service separation. Production HIPAA compliance also requires organizational controls, signed BAAs, incident response procedures, access reviews, training, vendor due diligence, backup testing, and environment-specific risk assessment.

## Service Boundaries

- `apps/api`: Clinical API, RBAC, WebSockets, audit trail, data access
- `apps/web`: Responsive clinical operations UI
- `services/ml`: Predictive analytics service boundary
- `infra`: Reverse proxy and deployment-oriented configuration

## Core Features

- Patient registration and encrypted medical history
- Appointment scheduling with doctor availability checks
- EMR encounters, prescriptions, and lab result linking
- Billing invoices, insurance claims, and payment state
- Inventory tracking with low-stock alert events
- Lab order and result workflows
- RBAC for admin, doctor, nurse, billing, lab, inventory, and patient users
- WebSocket alerts for urgent events
- Telemedicine session records and e-prescriptions
- Reporting and predictive analytics integration
- Separate admin, patient, and employee dashboards
- Fully linked sidebar navigation for Dashboard, Patients, Scheduling, EMR, Billing, Inventory, Lab, Telemedicine, and Security
- English/Urdu language switching with RTL layout
- Light, dark, and system theme modes
- Adaptive density mode for desktop, tablet, and mobile workflows
- Smart AI, blockchain integrity, and voice-assistant surfaces
- Enterprise bed board, FHIR-style exchange, collaboration room, offline sync, and readiness APIs
- Kubernetes deployment baseline, OpenAPI slice, architecture diagram, and k6 smoke load test
- Separate AI Support Agent RAG application with FastAPI, ChromaDB, React, JWT roles, document upload, citations, and Docker Compose
- Three.js 3D hospital capacity/risk visualization
- Chart.js trend and distribution charts
- GraphQL dashboard summary query for advanced clients

## Development

```bash
npm install
npm run prisma:generate -w apps/api
npm run dev
```

Run tests:

```bash
npm test
npm run test:e2e -w apps/web
```
