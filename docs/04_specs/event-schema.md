# Event Schema

See CLAUDE.md Section 5 for the events table schema.

## Event Types

All system actions are logged as immutable events in the `events` table.

| Event Type | Source | Description |
|-----------|--------|-------------|
| `call.inbound` | WF16 | Inbound call received |
| `identity.resolved` | WF109 | Phone number mapped to lead |
| `booking.created` | WF18 | Appointment booked |
| `wrapup.completed` | WF22 | Call summary generated |
| `phi_access` | WF11 | PHI data accessed (audit) |
