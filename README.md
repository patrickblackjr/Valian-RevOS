# RevOS: Revenue Operating System for Dental Practices

**Infrastructure Backbone** | **Source of Truth for All Workflows & Schemas**

---

## Overview

RevOS is a multi-tenant Revenue Operating System that automates front-office operations for dental practices. This repository serves as the **source of truth** for all:

- n8n Workflow definitions (auto-exported via WF103)
- Database schemas and migrations
- System documentation

## Repository Structure

```
Valian-RevOS/
├── workflows/           # n8n workflow JSON definitions
│   ├── WF103_*.json    # GitHub Auto-Export workflow
│   ├── WF106_*.json    # Schema Builder workflow
│   └── WF###_*.json    # All other workflows (auto-exported)
├── database/
│   ├── blueprints/     # Schema blueprints (input to WF106)
│   └── migrations/     # Applied migration SQL scripts
├── docs/               # System documentation
└── CLAUDE.md          # AI assistant context & system specs
```

## Core Infrastructure Workflows

| Workflow | Purpose | Status |
|----------|---------|--------|
| **WF103** | Auto-exports all WF### workflows to GitHub every 15 min | Active |
| **WF106** | Schema builder - deploys database tables via JSON blueprints | Active |
| **WF011** | Event logger - immutable audit trail | Planned |

## How It Works

### WF103: GitHub Auto-Export
- Runs every 15 minutes via cron
- Lists all workflows in n8n matching `WF###` pattern
- Exports each workflow JSON to this repo
- Commits changes automatically

### WF106: Schema Auto-Builder
- Receives JSON schema blueprints via webhook
- Validates input, checks idempotency
- Generates SQL with RLS policies
- Deploys to Supabase with transaction safety
- Logs migration to `schema_migrations` table

## Quick Start

### Deploy a Schema
```bash
curl -X POST https://valiansystems.app.n8n.cloud/webhook/wf106/schema-builder \
  -H "Content-Type: application/json" \
  -d @database/blueprints/001_foundation_schema.json
```

### Trigger Manual Export
```bash
# WF103 runs automatically, but can be triggered manually in n8n
```

## Tech Stack

- **Workflow Engine:** n8n Cloud (valiansystems.app.n8n.cloud)
- **Database:** Supabase (PostgreSQL with RLS)
- **Version Control:** GitHub (this repo)
- **AI Integration:** Claude Code + MCP Server

## Naming Conventions

- Workflows: `WF###_Name_Here.json` (e.g., `WF106_Schema_Builder.json`)
- Schema versions: Sequential 3-digit numbers (`001`, `002`, `003`)
- Tables: snake_case with multi-tenant columns (`tenant_id`, `created_at`, etc.)

---

**Last Updated:** 2026-02-05
**System Version:** Day 1 MVP
