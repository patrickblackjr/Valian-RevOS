# WF103 — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | [Cron_Trigger](01_Cron_Trigger.md) | Cron | Trigger every 15 minutes |
| 02 | [Fetch_Workflows](02_Fetch_Workflows.md) | HTTPRequest | Get workflow list from n8n API |
| 03 | [Loop_Workflows](03_Loop_Workflows.md) | SplitInBatches | Process each workflow |
| 04 | [Fetch_Content](04_Fetch_Content.md) | HTTPRequest | Get current GitHub file content |
| 05 | [Compare_Content](05_Compare_Content.md) | Code | Compare base64 content to detect changes |
| 06 | [IF_Changed](06_IF_Changed.md) | IF | Branch on content change detected |
| 07 | [Push_ToGitHub](07_Push_ToGitHub.md) | HTTPRequest | Push updated workflow JSON to GitHub |
| 08 | [Send_Alert](08_Send_Alert.md) | HTTPRequest | Send Layout C scorecard to Slack |

## Routing

```
01_Cron_Trigger → 02_Fetch_Workflows
02_Fetch_Workflows → 03_Loop_Workflows
03_Loop_Workflows → 04_Fetch_Content
04_Fetch_Content → 05_Compare_Content
05_Compare_Content → 06_IF_Changed
06_IF_Changed → 07_Push_ToGitHub
07_Push_ToGitHub → 08_Send_Alert
08_Send_Alert → (end)
```

## Notes

<!-- Add routing notes, branch conditions, etc. -->
