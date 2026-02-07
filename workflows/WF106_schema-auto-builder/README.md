# WF106 — Schema Auto-Builder

## Summary

Receives JSON blueprint, generates SQL, applies to Supabase with conditional RLS auto-generation

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
- `schema_migrations`

### Other Workflows
- WF011

### External Services
- supabase

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: `idem:{tenant_id}:wf106:{trigger_id}:{payload_hash}`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | Webhook_Trigger | Webhook | Receive schema blueprint JSON |
| 02 | Validate_Blueprint | Code | Validate blueprint structure and table names |
| 03 | Generate_SQL | Code | Generate CREATE TABLE SQL from blueprint |
| 04 | Generate_RLS | Code | Generate RLS policies for tables with tenant_id |
| 05 | Apply_Migration | Postgres | Execute SQL against Supabase |
| 06 | Record_Migration | Postgres | Insert row into schema_migrations |
| 07 | Respond_Result | RespondToWebhook | Return migration result with rls_tables metadata |

## Test Cases

| File | Intent |
|------|--------|
| `tests/sample_payloads/happy_path.json` | Successful execution |
| <!-- add more --> | |
