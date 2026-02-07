# How We Work

## Workflow-Centric Development

- Every feature maps to one or more WF### workflows
- Workflows are first-class artifacts with their own folder, docs, and tests
- All work starts as a GitHub Issue

## Branch → PR → Merge Flow

1. Create Issue: `WF###: <short goal>`
2. Create branch: `wf###-<slug>`
3. Build workflow in n8n
4. Export JSON to `workflows/WF###_<slug>/n8n/WF###.json`
5. Fill node docs and test payloads
6. Run `node scripts/repo_validate.js` locally
7. Open PR linking the Issue
8. CI runs validation + secret scan
9. Review and merge

## Commit Message Format

- `WF###: <description>` for workflow changes
- `Supabase: <description>` for database changes
- `docs: <description>` for documentation changes
- `scripts: <description>` for tooling changes
- `ci: <description>` for CI/CD changes

## No Scope Creep

- If it's not on today's task list, it waits
- One PR per logical change
- Don't mix unrelated changes
