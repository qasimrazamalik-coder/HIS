# Sidebar Navigation

The React shell uses typed client-side navigation for the primary HIS modules:

- Dashboard
- Patients
- Scheduling
- EMR
- Billing
- Inventory
- Lab
- Telemedicine
- Security

Each sidebar item updates the active module without a full page reload. Module access is checked against the active role so protected sections, such as Security, are disabled for users that should not enter them.

## User Experience

- Active sidebar items use `aria-current="page"`.
- Locked module buttons are disabled and labelled with a role-specific title.
- The role selector changes the visible permissions immediately.
- The language toggle demonstrates multilingual labels for staff and patient-facing navigation.
- Layouts collapse to single-column panels on mobile.

## Testing

Run unit tests:

```bash
npm test
```

Run browser navigation tests:

```bash
npm run test:e2e -w apps/web
```

