# WF011 — Event Logger

## Summary

Immutable event ledger — logs every system action with T3 PII hashing and phi_access support

## Owner

Builder

## Status

Draft

## Trigger

<!-- Describe the trigger: Webhook, Cron, Execute Workflow, Manual, etc. -->
TBD

## Inputs

<!-- Exact JSON schema fields, required vs optional -->

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenant_id` | string (UUID) | Yes | Tenant identifier |
| <!-- add fields --> | | | |

## Outputs

<!-- Exact JSON schema fields -->

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | ok \| noop \| blocked \| retry \| failed |
| `summary` | string | Human-readable result |
| <!-- add fields --> | | |

## Happy Path

<!-- Describe the successful execution flow step by step -->

1. TBD

## Failure Modes

| # | Failure | Detection | Resolution |
|---|---------|-----------|------------|
| 1 | <!-- failure --> | <!-- how detected --> | <!-- how to fix --> |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

## Dependencies

### DB Tables
- `events`
- `event_metadata`
- `idempotency_keys`

### Other Workflows
- None

### External Services
- supabase
- slack

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: `idem:{tenant_id}:wf011:{trigger_id}:{payload_hash}`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | Webhook_Trigger | Webhook | Receive event logging requests |
| 02 | Validate_Payload | Code | Validate required event fields |
| 03 | Hash_PII | Code | Hash T3 PII fields for subject_ref pointers |
| 04 | Check_Idempotency | Postgres | Check idempotency key to prevent duplicates |
| 05 | IF_Duplicate | IF | Branch on whether event already exists |
| 06 | Insert_Event | Postgres | Write event to events table |
| 07 | Insert_Metadata | Postgres | Write event metadata to event_metadata table |
| 08 | Send_Alert | HTTPRequest | Send Slack alert for critical events |
| 09 | Respond_Success | RespondToWebhook | Return event ID and status |

## Test Cases

| File | Intent |
|------|--------|
| `tests/sample_payloads/happy_path.json` | Successful execution |
| <!-- add more --> | |
