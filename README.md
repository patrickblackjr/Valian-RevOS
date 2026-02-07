# RevOS: Revenue Operating System for Dental Practices

**Infrastructure Backbone** | **Source of Truth for All Workflows & Schemas**

---

## Overview

RevOS is a multi-tenant Revenue Operating System that automates front-office operations for dental practices. This monorepo is the **source of truth** for all workflows, schemas, documentation, and tooling.

## Repository Structure

```
valian/
  README.md                     # This file
  CLAUDE.md                     # AI assistant context & system specs
  CHANGELOG.md                  # All changes tracked here

  docs/
    00_start-here/              # Setup, overview, how-we-work
    01_product/                 # Vision, roadmap, pricing, ICP, GTM
    02_architecture/            # System context, data flows, decisions
    03_runbooks/                # Incident response, deploy, rollback
    04_specs/                   # WF catalog, event schema, naming standards
    05_archive/                 # Historical build docs (Day 1 artifacts)

  workflows/                    # One folder per WF (first-class artifacts)
    WF011_event-logger/         # Immutable event ledger
    WF016_inbound-call-router/  # Twilio inbound call handling
    WF042_slack-bot/            # Slack command handler + AI chat
    WF103_github-auto-export/   # Auto-exports n8n workflows to GitHub
    WF106_schema-auto-builder/  # Deploys DB tables via JSON blueprints
    WF201_build-digest/         # 12h task summary to Slack

  supabase/                     # Database schema, migrations, functions
    migrations/                 # SQL files: YYYYMMDD_NNNN_<slug>.sql
    functions/                  # PL/pgSQL functions
    policies/                   # RLS policies
    seed/                       # Seed data and blueprints

  services/                     # Code services (API, worker, web) — grows over time
  integrations/                 # Integration contracts (Twilio, Slack, OpenAI)
  scripts/                      # Dev/ops scripts (scaffold, lint, export, deploy)
  .github/                      # Issue/PR templates, CI workflows
```

## Workflow Folder Template

Every workflow follows this structure:

```
workflows/WF###_<slug>/
  README.md                     # Purpose, inputs, outputs, failure modes
  changelog.md                  # Version history
  wf.meta.json                  # Machine-readable metadata

  n8n/
    WF###.json                  # Canonical n8n export (only place for exports!)

  nodes/
    00_map.md                   # Node list + routing map
    node_index.json             # Machine-readable node index
    01_<NodeName>.md            # Per-node documentation

  tests/
    sample_payloads/
      happy_path.json           # Required: successful execution input
    expected_outputs/
      happy_path.json           # Required: expected output
    notes.md                    # Test assumptions + replay instructions
```

## Quick Start

### Scaffold a New Workflow

```bash
node scripts/wf_scaffold.js --input scripts/wf_spec_example.json
```

### Validate Repository Structure

```bash
node scripts/repo_validate.js
```

### Scan for Secrets

```bash
node scripts/secret_scan.js
```

### Normalize an n8n Export

```bash
node scripts/wf_export_normalize.js --input-file /path/to/export.json
```

## Core Workflows

| Workflow | Purpose | Status |
|----------|---------|--------|
| **WF011** | Event Logger — immutable audit trail for all system actions | Active |
| **WF042** | Slack Bot — command handler with RBAC, AI chat, tool routing | Active |
| **WF103** | GitHub Auto-Export — syncs n8n workflows to repo every 15 min | Active |
| **WF106** | Schema Auto-Builder — deploys DB tables via JSON blueprints | Active |
| **WF201** | Build Digest — 12-hour task summary sent to Slack | Active |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/wf_scaffold.js` | Generate a new WF folder from a JSON spec |
| `scripts/wf_export_normalize.js` | Canonicalize, redact secrets, and route n8n exports |
| `scripts/repo_validate.js` | Lint repo structure against the authoritative spec |
| `scripts/secret_scan.js` | Scan for leaked API keys, tokens, and passwords |

## Tech Stack

- **Workflow Engine:** n8n Cloud (valiansystems.app.n8n.cloud)
- **Database:** Supabase (PostgreSQL with RLS)
- **Voice/Calls:** TBD (Vapi/Bland/Retell/ElevenLabs)
- **SMS:** Twilio
- **Alerts:** Slack
- **Version Control:** GitHub (this repo)
- **AI:** Claude Code + MCP Servers

## Conventions

- **Branches:** `wf###-<slug>` or `db-NNNN-<slug>`
- **Commits:** `WF###: <description>` or `Supabase: <description>`
- **Issues:** `WF###: <short goal>`
- **Exports:** Only in `workflows/WF###_<slug>/n8n/WF###.json`
- **No secrets in repo** — enforced by CI on every PR

See [docs/04_specs/naming-standards.md](docs/04_specs/naming-standards.md) for full conventions.

---

**Last Updated:** 2026-02-07
**System Version:** Day 1 MVP
