# Release Process

## Workflow Releases

Workflows are released by deploying to the n8n cloud instance. The repo serves as the source of truth and audit trail.

1. Merge PR to `main`
2. WF103 (GitHub Auto-Export) keeps repo in sync with n8n
3. Version bumps documented in `workflows/WF###_<slug>/changelog.md`

## Database Releases

1. Create migration in `supabase/migrations/YYYYMMDD_NNNN_<slug>.sql`
2. Test locally or in staging
3. Apply via WF106 Schema Auto-Builder or Supabase CLI
4. Record in `supabase/README.md`

## Versioning

- Workflows: `vX.Y.Z` in `wf.meta.json`
- Database: Sequential migration numbering `YYYYMMDD_NNNN`
- Repo: CHANGELOG.md tracks all changes
