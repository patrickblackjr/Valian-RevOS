# WF042 — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | [Webhook_SlackEvent](01_Webhook_SlackEvent.md) | Webhook | Receive Slack event webhooks |
| 02 | [Verify_Signature](02_Verify_Signature.md) | Code | Verify Slack HMAC-SHA256 signature |
| 03 | [Dedup_EventId](03_Dedup_EventId.md) | Code | Check event_id for deduplication |
| 04 | [Filter_BotMessages](04_Filter_BotMessages.md) | IF | Filter out bot messages and subtypes |
| 05 | [Load_RBAC](05_Load_RBAC.md) | Postgres | Load user role from slack_rbac table |
| 06 | [Load_ChannelPolicy](06_Load_ChannelPolicy.md) | Postgres | Load channel tool permissions |
| 07 | [Route_Intent](07_Route_Intent.md) | Code | Classify intent and route to tool |
| 08 | [AI_Chat](08_AI_Chat.md) | HTTPRequest | Claude API call for chat responses |
| 09 | [Send_Response](09_Send_Response.md) | HTTPRequest | Post response to Slack channel/thread |

## Routing

```
01_Webhook_SlackEvent → 02_Verify_Signature
02_Verify_Signature → 03_Dedup_EventId
03_Dedup_EventId → 04_Filter_BotMessages
04_Filter_BotMessages → 05_Load_RBAC
05_Load_RBAC → 06_Load_ChannelPolicy
06_Load_ChannelPolicy → 07_Route_Intent
07_Route_Intent → 08_AI_Chat
08_AI_Chat → 09_Send_Response
09_Send_Response → (end)
```

## Notes

<!-- Add routing notes, branch conditions, etc. -->
