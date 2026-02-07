# Naming Standards

## Workflow Folders

- Pattern: `WF###_<kebab-slug>/`
- WF ID: Must match `^WF\d{3}$` (three digits, zero-padded)
- Slug: kebab-case, descriptive, no abbreviations
- Examples:
  - `WF016_inbound-call-router/`
  - `WF103_build-system/`
  - `WF109_identity-resolution/`

## Workflow JSON Exports

- Location: `workflows/WF###_<slug>/n8n/WF###.json`
- Filename must match the WF ID exactly
- Never store exports elsewhere

## Node Documentation

- Location: `workflows/WF###_<slug>/nodes/`
- Map file: `00_map.md` (always present)
- Node index: `node_index.json` (machine-readable node list)
- Node docs: `NN_<node_name>.md` where NN is zero-padded order number
- Node name: PascalCase or the exact n8n node name
- Examples:
  - `01_Webhook_InboundCall.md`
  - `02_Validate_Envelope.md`
  - `03_IF_HasLeadId.md`

## Test Payloads

- Location: `workflows/WF###_<slug>/tests/`
- Sample payloads: `sample_payloads/<case_name>.json` (snake_case)
- Expected outputs: `expected_outputs/<case_name>.json` (snake_case)
- Every workflow must have at least `happy_path.json` in both directories
- Additional cases for branches: `no_availability.json`, `duplicate_booking.json`, etc.

## Branches

- Workflow branches: `wf###-<slug>` (e.g., `wf016-inbound-router`)
- Database branches: `db-NNNN-<slug>` (e.g., `db-0002-add-leads-lock`)
- Feature branches: `feat-<slug>`
- Fix branches: `fix-<slug>`

## Commit Messages

- `WF###: <description>` for workflow changes
- `Supabase: <description>` for database changes
- `docs: <description>` for documentation
- `scripts: <description>` for tooling
- `ci: <description>` for CI/CD

## Issue Titles

- Format: `WF###: <short goal>`
- Example: `WF016: inbound call router (happy path)`

## Database Migrations

- Format: `YYYYMMDD_NNNN_<slug>.sql`
- Example: `20260206_0001_init.sql`
