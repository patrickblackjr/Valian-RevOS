# WF201 — 12 hour Dev Sprint update — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | [Cron_Trigger](01_Cron_Trigger.md) | Cron | Trigger at 9AM and 9PM EST |
| 02 | [Query_Tasks](02_Query_Tasks.md) | Postgres | Query pending/in-progress/completed tasks from last 12h |
| 03 | [Format_Digest](03_Format_Digest.md) | Code | Format Layout C scorecard message |
| 04 | [Send_Slack](04_Send_Slack.md) | HTTPRequest | Post digest to #revos-build Slack channel |

## Routing

```
01_Cron_Trigger → 02_Query_Tasks
02_Query_Tasks → 03_Format_Digest
03_Format_Digest → 04_Send_Slack
04_Send_Slack → (end)
```

## Notes

<!-- Add routing notes, branch conditions, etc. -->
