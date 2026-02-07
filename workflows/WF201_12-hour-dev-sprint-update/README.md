# WF201 — 12 hour Dev Sprint update

## Summary

12-hour dev sprint update with Layout C scorecard, queries tasks table, sends to Slack

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
- `tasks`

### Other Workflows
- None

### External Services
- supabase
- slack

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: `idem:{tenant_id}:wf201:{trigger_id}:{payload_hash}`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | Cron_Trigger | Cron | Trigger at 9AM and 9PM EST |
| 02 | Query_Tasks | Postgres | Query pending/in-progress/completed tasks from last 12h |
| 03 | Format_Digest | Code | Format Layout C scorecard message |
| 04 | Send_Slack | HTTPRequest | Post digest to #revos-build Slack channel |

## Test Cases

| File | Intent |
|------|--------|
| `tests/sample_payloads/happy_path.json` | Successful execution |
| <!-- add more --> | |
