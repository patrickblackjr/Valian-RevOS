# Supabase Migration Runbook

## Creating a Migration

1. Create file: `supabase/migrations/YYYYMMDD_NNNN_<slug>.sql`
2. Include header comment: what it changes, why, how to rollback
3. Test in staging
4. Apply via WF106 or Supabase CLI
5. Update `supabase/README.md`

## Migration Naming

- Format: `YYYYMMDD_NNNN_<slug>.sql`
- Example: `20260206_0001_init.sql`
- Sequential numbering within each date
