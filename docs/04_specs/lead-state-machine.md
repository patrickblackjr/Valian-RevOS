# Lead State Machine

## States

- `new` — First contact, no interaction yet
- `contacted` — AI has spoken to lead
- `appointment_set` — Appointment booked
- `no_show` — Missed appointment
- `active_patient` — Has attended at least one appointment
- `churned` — No contact in 12+ months

## Transitions

```
new → contacted (first call/SMS)
contacted → appointment_set (booking created)
appointment_set → active_patient (attended appointment)
appointment_set → no_show (missed appointment)
no_show → appointment_set (rebooked)
active_patient → churned (12 months no contact)
```
