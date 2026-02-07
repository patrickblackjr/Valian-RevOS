# WF042 — Slack Bot

## Summary

Slack command handler with RBAC, AI chat, SQL sandbox, GitHub reads, and channel-aware personas

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
- `slack_messages`
- `bot_actions`
- `slack_rbac`
- `slack_channel_policy`

### Other Workflows
- WF011

### External Services
- slack
- supabase
- anthropic
- github

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: `idem:{tenant_id}:wf042:{trigger_id}:{payload_hash}`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | Webhook_SlackEvent | Webhook | Receive Slack event webhooks |
| 02 | Verify_Signature | Code | Verify Slack HMAC-SHA256 signature |
| 03 | Dedup_EventId | Code | Check event_id for deduplication |
| 04 | Filter_BotMessages | IF | Filter out bot messages and subtypes |
| 05 | Load_RBAC | Postgres | Load user role from slack_rbac table |
| 06 | Load_ChannelPolicy | Postgres | Load channel tool permissions |
| 07 | Route_Intent | Code | Classify intent and route to tool |
| 08 | AI_Chat | HTTPRequest | Claude API call for chat responses |
| 09 | Send_Response | HTTPRequest | Post response to Slack channel/thread |

## Test Cases

| File | Intent |
|------|--------|
| `tests/sample_payloads/happy_path.json` | Successful execution |
| <!-- add more --> | |
