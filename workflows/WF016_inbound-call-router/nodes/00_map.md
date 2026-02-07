# WF016 — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | [Webhook_InboundCall](01_Webhook_InboundCall.md) | Webhook | Entry point for Twilio inbound call |
| 02 | [Validate_Envelope](02_Validate_Envelope.md) | Code | Validate required fields from Twilio payload |
| 03 | [Resolve_Identity](03_Resolve_Identity.md) | ExecuteWorkflow | Call WF109 to resolve phone to lead_id |
| 04 | [Create_CallSession](04_Create_CallSession.md) | Postgres | Insert call_session row in database |
| 05 | [Log_Event](05_Log_Event.md) | ExecuteWorkflow | Call WF011 to log call.inbound event |
| 06 | [Respond_TwiML](06_Respond_TwiML.md) | RespondToWebhook | Return TwiML response to Twilio |

## Routing

```
01_Webhook_InboundCall → 02_Validate_Envelope
02_Validate_Envelope → 03_Resolve_Identity
03_Resolve_Identity → 04_Create_CallSession
04_Create_CallSession → 05_Log_Event
05_Log_Event → 06_Respond_TwiML
06_Respond_TwiML → (end)
```

## Notes

<!-- Add routing notes, branch conditions, etc. -->
