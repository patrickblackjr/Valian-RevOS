# Valian RevOS — Repository Overview

## What This Repo Is

This is the monorepo for **RevOS**, a Revenue Operating System for dental and orthodontic practices. It contains:

- **docs/** — Human documentation (product, architecture, runbooks, specs)
- **workflows/** — All n8n workflows + node docs + test payloads
- **supabase/** — Database schema, migrations, functions, RLS policies
- **services/** — Code services (API, worker, web) — grows over time
- **integrations/** — Integration contracts (Twilio, Slack, OpenAI, etc.)
- **scripts/** — Dev/ops scripts (scaffold, lint, export, deploy)
- **.github/** — Issue/PR templates, CI workflows

## Quick Start

### 1. Scaffold a New Workflow

```bash
node scripts/wf_scaffold.js --input path/to/wf_spec.json
```

Input JSON format:

```json
{
  "wf_id": "WF016",
  "wf_slug": "inbound-call-router",
  "wf_title": "Inbound Call Router",
  "wf_summary": "Routes inbound Twilio calls into orchestration",
  "nodes": [
    {"order": 1, "name": "Webhook_InboundCall", "type": "Webhook", "purpose": "Entry point"},
    {"order": 2, "name": "Validate_Envelope", "type": "Code", "purpose": "Validate inputs"}
  ],
  "dependencies": {
    "db_tables": ["leads"],
    "other_wfs": ["WF011"],
    "external": ["twilio", "supabase"]
  }
}
```

### 2. Validate Repository Structure

```bash
node scripts/repo_validate.js
```

Checks folder naming, required files, README sections, node docs, test payloads, and catalog consistency.

### 3. Scan for Secrets

```bash
node scripts/secret_scan.js
```

Scans all tracked files for API keys, tokens, private keys, and other secrets. Fails with file + line output.

### 4. Normalize an n8n Export

```bash
node scripts/wf_export_normalize.js --input-dir /path/to/raw/exports
```

Canonicalizes JSON, redacts secrets, routes each export to the correct `workflows/WF###/n8n/` path.

### 5. Run CI Locally

```bash
node scripts/repo_validate.js && node scripts/secret_scan.js
```

This is exactly what the GitHub Actions PR check runs.

## Key Conventions

- **Workflow folders**: `workflows/WF###_<kebab-slug>/`
- **Exports**: Only in `workflows/WF###_<slug>/n8n/WF###.json`
- **Node docs**: `workflows/WF###_<slug>/nodes/NN_<node_name>.md`
- **Test payloads**: `workflows/WF###_<slug>/tests/sample_payloads/*.json`
- **Branches**: `wf###-<slug>` or `db-NNNN-<slug>`
- **Commits**: `WF###: <description>` or `Supabase: <description>`

See [docs/04_specs/naming-standards.md](../04_specs/naming-standards.md) for full naming rules.
