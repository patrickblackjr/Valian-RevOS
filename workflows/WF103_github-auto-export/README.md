# WF103 — GitHub Auto-Export

## Summary

Auto-exports n8n workflows to GitHub every 15 minutes with content change detection and Layout C scorecard alerts

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
- None

### Other Workflows
- WF011

### External Services
- github
- n8n-api
- slack

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: `idem:{tenant_id}:wf103:{trigger_id}:{payload_hash}`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | Cron_Trigger | Cron | Trigger every 15 minutes |
| 02 | Fetch_Workflows | HTTPRequest | Get workflow list from n8n API |
| 03 | Loop_Workflows | SplitInBatches | Process each workflow |
| 04 | Fetch_Content | HTTPRequest | Get current GitHub file content |
| 05 | Compare_Content | Code | Compare base64 content to detect changes |
| 06 | IF_Changed | IF | Branch on content change detected |
| 07 | Push_ToGitHub | HTTPRequest | Push updated workflow JSON to GitHub |
| 08 | Send_Alert | HTTPRequest | Send Layout C scorecard to Slack |

## Test Cases

| File | Intent |
|------|--------|
| `tests/sample_payloads/happy_path.json` | Successful execution |
| <!-- add more --> | |
