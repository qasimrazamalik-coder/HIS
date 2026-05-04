# API Overview

All protected routes require:

```http
Authorization: Bearer <jwt>
```

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `GET /api/appointments/availability/:doctorId`
- `POST /api/appointments`
- `POST /api/emr/encounters`
- `GET /api/emr/patients/:patientId/timeline`
- `POST /api/billing/invoices`
- `GET /api/billing/invoices`
- `POST /api/inventory/items`
- `GET /api/inventory/items`
- `POST /api/lab/orders`
- `POST /api/lab/results`
- `POST /api/telemedicine/sessions`
- `GET /api/reports/hospital-performance`
- `POST /api/analytics/readmission-risk`
- `GET /api/dashboards/admin`
- `GET /api/dashboards/patient`
- `GET /api/dashboards/employee`
- `POST /api/smart/integrity-chain/anchor`
- `POST /api/smart/decision-support`
- `GET /api/smart/voice/intents`
- `GET /api/enterprise/bed-board`
- `GET /api/enterprise/fhir/patient/:id`
- `GET /api/enterprise/collaboration/rooms`
- `POST /api/enterprise/offline/sync`
- `GET /api/enterprise/readiness`
- `POST /graphql`

WebSocket alerts are emitted on the `alert` event.

Example GraphQL query:

```graphql
{
  dashboard(role: "admin") {
    role
    notifications
    analytics {
      occupancy
      readmissionRiskAverage
    }
  }
}
```
