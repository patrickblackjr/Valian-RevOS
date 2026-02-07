# Deployment Runbook

## Workflow Deployment

1. Build/edit workflow in n8n Cloud
2. Test with sample payloads
3. Export JSON from n8n
4. Run `node scripts/wf_export_normalize.js` to canonicalize
5. Commit to repo
6. Open PR, pass CI checks
7. Merge to main

## Database Deployment

1. Write migration SQL in `supabase/migrations/`
2. Test in staging or via WF106
3. Apply migration
4. Verify with `node scripts/repo_validate.js`
