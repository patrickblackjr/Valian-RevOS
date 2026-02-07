# WF011 — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | [Webhook_Trigger](01_Webhook_Trigger.md) | Webhook | Receive event logging requests |
| 02 | [Validate_Payload](02_Validate_Payload.md) | Code | Validate required event fields |
| 03 | [Hash_PII](03_Hash_PII.md) | Code | Hash T3 PII fields for subject_ref pointers |
| 04 | [Check_Idempotency](04_Check_Idempotency.md) | Postgres | Check idempotency key to prevent duplicates |
| 05 | [IF_Duplicate](05_IF_Duplicate.md) | IF | Branch on whether event already exists |
| 06 | [Insert_Event](06_Insert_Event.md) | Postgres | Write event to events table |
| 07 | [Insert_Metadata](07_Insert_Metadata.md) | Postgres | Write event metadata to event_metadata table |
| 08 | [Send_Alert](08_Send_Alert.md) | HTTPRequest | Send Slack alert for critical events |
| 09 | [Respond_Success](09_Respond_Success.md) | RespondToWebhook | Return event ID and status |

## Routing

```
01_Webhook_Trigger → 02_Validate_Payload
02_Validate_Payload → 03_Hash_PII
03_Hash_PII → 04_Check_Idempotency
04_Check_Idempotency → 05_IF_Duplicate
05_IF_Duplicate → 06_Insert_Event
06_Insert_Event → 07_Insert_Metadata
07_Insert_Metadata → 08_Send_Alert
08_Send_Alert → 09_Respond_Success
09_Respond_Success → (end)
```

## Notes

<!-- Add routing notes, branch conditions, etc. -->
