# Architecture Diagram

```mermaid
flowchart LR
  Web[React HIS Workspace] --> API[Node.js API Gateway]
  Web <--> WS[Socket.IO Alerts + Collaboration]
  API --> PG[(PostgreSQL)]
  API --> Redis[(Redis Cache/Fanout)]
  API --> ML[FastAPI ML Service]
  API --> FHIR[FHIR/HL7 Adapter Boundary]
  API --> Ledger[Integrity Ledger Adapter]
  API --> Insurance[Insurance Clearinghouse Adapter]
  API --> PACS[PACS/RIS Adapter]
  WS --> Redis
```

## Module Boundaries

- Patient life-cycle and EMR
- Scheduling, OPD/IPD queueing, and bed board
- Billing and revenue cycle
- Pharmacy, inventory, and procurement
- LIS/RIS/PACS diagnostics
- Telemedicine and remote care
- Analytics, reporting, AI, and 3D visualization
- Security, audit, consent, and interoperability

