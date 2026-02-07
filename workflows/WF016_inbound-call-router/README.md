# WF016 — Inbound Call Router

## Summary

Routes inbound Twilio calls into orchestration

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
- `call_sessions`
- `leads`

### Other Workflows
- WF011
- WF109

### External Services
- twilio
- supabase

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: `idem:{tenant_id}:wf016:{trigger_id}:{payload_hash}`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | Webhook_InboundCall | Webhook | Entry point for Twilio inbound call |
| 02 | Validate_Envelope | Code | Validate required fields from Twilio payload |
| 03 | Resolve_Identity | ExecuteWorkflow | Call WF109 to resolve phone to lead_id |
| 04 | Create_CallSession | Postgres | Insert call_session row in database |
| 05 | Log_Event | ExecuteWorkflow | Call WF011 to log call.inbound event |
| 06 | Respond_TwiML | RespondToWebhook | Return TwiML response to Twilio |

## Test Cases

| File | Intent |
|------|--------|
| `tests/sample_payloads/happy_path.json` | Successful execution |
| <!-- add more --> | |
