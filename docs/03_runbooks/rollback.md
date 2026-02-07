# Rollback Runbook

## Workflow Rollback

1. Find previous version in Git history: `git log -- workflows/WF###_<slug>/n8n/WF###.json`
2. Checkout previous version: `git checkout <commit> -- workflows/WF###_<slug>/n8n/WF###.json`
3. Import into n8n
4. Activate the old version
5. Commit the rollback with message: `WF###: rollback to <version>`

## Database Rollback

Each migration in `supabase/migrations/` should document its rollback procedure in a comment block at the top.
