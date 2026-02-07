# WF106 — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
| 01 | [Webhook_Trigger](01_Webhook_Trigger.md) | Webhook | Receive schema blueprint JSON |
| 02 | [Validate_Blueprint](02_Validate_Blueprint.md) | Code | Validate blueprint structure and table names |
| 03 | [Generate_SQL](03_Generate_SQL.md) | Code | Generate CREATE TABLE SQL from blueprint |
| 04 | [Generate_RLS](04_Generate_RLS.md) | Code | Generate RLS policies for tables with tenant_id |
| 05 | [Apply_Migration](05_Apply_Migration.md) | Postgres | Execute SQL against Supabase |
| 06 | [Record_Migration](06_Record_Migration.md) | Postgres | Insert row into schema_migrations |
| 07 | [Respond_Result](07_Respond_Result.md) | RespondToWebhook | Return migration result with rls_tables metadata |

## Routing

```
01_Webhook_Trigger → 02_Validate_Blueprint
02_Validate_Blueprint → 03_Generate_SQL
03_Generate_SQL → 04_Generate_RLS
04_Generate_RLS → 05_Apply_Migration
05_Apply_Migration → 06_Record_Migration
06_Record_Migration → 07_Respond_Result
07_Respond_Result → (end)
```

## Notes

<!-- Add routing notes, branch conditions, etc. -->
