# WF106 v2.0 Implementation Guide

**Version:** 2.0.0 (Orchestration Convention Compliant)
**Date:** 2026-02-05
**Status:** Ready for Deployment

---

## Overview

WF106 v2.0 is the **Schema Auto-Builder** workflow that deploys database schemas to Supabase with full Orchestration Convention compliance, idempotency, and safety features.

### What's New in v2.0

**Phase 1 Features (Day 1 MVP):**
- ✅ **Orchestration Envelope**: Full meta/subject/payload/context input contract
- ✅ **Idempotency Checking**: Never applies same schema version twice
- ✅ **Input Validation**: Catches missing/invalid fields before execution
- ✅ **Auto-Normalization**: Adds default columns (id, tenant_id, timestamps) automatically
- ✅ **SQL Safety Features**: Transaction wrapping, IF NOT EXISTS, pgcrypto extension
- ✅ **RLS Multi-Tenant Fence**: Every table gets RLS enabled + tenant_id policy
- ✅ **Migration Logging**: Every execution logged in schema_migrations table
- ✅ **WF11 Event Stub**: Placeholder for future event logging integration
- ✅ **Standard Output Contract**: meta_out/result/audit structure

**Deferred to Phase 2 (Later):**
- ❌ Diff Detection (S3: Discover Current DB State)
- ❌ Risk Gates (S4: Block dangerous changes)
- ❌ Verification Smoke Tests (S6: Post-apply validation)

---

## Architecture

### Node Flow (Simplified for Phase 1)

```
S0: Trigger
│
├─ Node 0.1: Webhook Trigger
│
S1: Envelope + Validation + Idempotency
│
├─ Node 1: Set Envelope Defaults
├─ Node 2: Code - Normalize Input (validate + add default columns)
├─ Node 3: IF - Invalid Input?
│   ├─ TRUE → Node 4: Respond Invalid (400)
│   └─ FALSE → Continue
│
├─ Node 5: Code - Build Idempotency Key
├─ Node 6: Postgres - Idempotency Lookup
├─ Node 7: IF - Already Applied?
│   ├─ TRUE → Node 8: Respond Noop (200)
│   └─ FALSE → Continue
│
S5: Generate SQL Migration
│
├─ Node 9: Code - Generate SQL (with safety features)
├─ Node 10: Postgres - Execute SQL
│
S7: Log + Return
│
├─ Node 11: Postgres - Write Migration Log
├─ Node 12: [Stub] WF11 Event Log (placeholder)
├─ Node 13: Set Output Envelope
└─ Node 14: Respond Applied (200)
```

### Key Enhancements Over v1.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Input Contract** | Plain JSON | Orchestration Envelope (meta/payload/subject/context) |
| **Idempotency** | Version-only check | Hash-based idempotency key |
| **Validation** | Basic try/catch | Structured validation with error array |
| **Default Columns** | Manual | Auto-added (id, tenant_id, timestamps) |
| **SQL Safety** | Basic CREATE TABLE | Transaction + IF NOT EXISTS + pgcrypto |
| **RLS** | Manual | Auto-enabled with tenant_id policy |
| **Output Contract** | Simple success/fail | Full meta_out/result/audit structure |
| **Event Logging** | None | WF11 stub (ready for integration) |

---

## Deployment Steps

### Prerequisites

1. **Supabase Connection Configured in n8n:**
   - Credential name: `Supabase RevOS Production`
   - Host: `db.vjnvddebjrrcgrapuhvn.supabase.co`
   - Port: `6543`
   - Database: `postgres`
   - Schema: `public`

2. **schema_migrations Table Exists:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.schema_migrations (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       version TEXT NOT NULL,
       description TEXT NOT NULL,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       applied_by TEXT NOT NULL,
       checksum TEXT,
       status TEXT NOT NULL,
       error_message TEXT,
       sql_script TEXT,
       metadata JSONB,
       UNIQUE(version, status)
   );
   ```

### Step 1: Import Workflow to n8n

**Option A: Via n8n UI**
1. Open n8n: https://valiansystems.app.n8n.cloud/
2. Click "Add workflow" → "Import from file"
3. Select `/Users/patrick.black/code/Valian/workflows/WF106_v2_Schema_Builder.json`
4. Click "Import"
5. Save workflow (gets assigned new workflow ID)

**Option B: Via n8n API (Preferred for Automation)**
```bash
# Set n8n API key
export N8N_API_KEY="n8n_api_4ba8ab69c7f18f0ab784ae79de7f6a71ec326f518ec45a5f3eb0a9d56029dca5"
export N8N_URL="https://valiansystems.app.n8n.cloud"

# Import workflow
curl -X POST "${N8N_URL}/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @/Users/patrick.black/code/Valian/workflows/WF106_v2_Schema_Builder.json
```

### Step 2: Activate Workflow

1. Open WF106 v2.0 in n8n UI
2. Click "Active" toggle (top-right)
3. Verify webhook URL is displayed (e.g., `https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2`)

### Step 3: Test with Sample Payload

**Test 1: Minimal Input (Default Envelope)**
```bash
curl -X POST https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "schema_version": "001",
      "description": "Foundation Schema - Test Tenant Table",
      "tables": [
        {
          "name": "tenants",
          "columns": [
            {"name": "name", "type": "TEXT", "not_null": true},
            {"name": "status", "type": "TEXT", "not_null": true, "default": "active"}
          ],
          "indexes": [
            {"name": "idx_tenants_status", "columns": ["status"]}
          ]
        }
      ]
    }
  }'
```

**Expected Response (200 OK):**
```json
{
  "meta_out": {
    "workflow_name": "WF106",
    "workflow_run_id": "wr_1738737600_system",
    "latency_ms": 3245,
    "success": true,
    "inputs_hash": "sha256_...",
    "outputs_hash": "sha256_..."
  },
  "result": {
    "status": "applied",
    "summary": "Applied schema v001: 1 tables created",
    "primary_outputs": {
      "schema_version": "001",
      "tables_created": 1,
      "indexes_created": 3,
      "migration_log_id": "uuid-...",
      "warnings": []
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [
      {"table": "schema_migrations", "record_id": "uuid-..."}
    ],
    "external_calls": [
      {"service": "supabase", "endpoint": "execute_sql", "latency_ms": 2800},
      {"service": "supabase", "endpoint": "insert_migration_log", "latency_ms": 150}
    ]
  }
}
```

**Test 2: Idempotency Check (Re-apply Same Version)**
```bash
# Run same payload again
curl -X POST https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2 \
  -H "Content-Type: application/json" \
  -d '{...same payload as Test 1...}'
```

**Expected Response (200 OK):**
```json
{
  "meta_out": {
    "workflow_name": "WF106",
    "workflow_run_id": "wr_1738737700_system",
    "latency_ms": 142,
    "success": true,
    "inputs_hash": "sha256_..."
  },
  "result": {
    "status": "noop",
    "summary": "Schema version 001 already applied (idempotent)",
    "primary_outputs": {
      "schema_version": "001",
      "already_applied_at": "2026-02-05T10:15:23.456Z",
      "migration_log_id": "uuid-..."
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [],
    "external_calls": [
      {"service": "supabase", "endpoint": "query_schema_migrations", "latency_ms": 50}
    ]
  }
}
```

**Test 3: Validation Failure**
```bash
curl -X POST https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "description": "Invalid - Missing Version",
      "tables": []
    }
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "meta_out": {
    "workflow_name": "WF106",
    "workflow_run_id": "wr_1738737800_system",
    "latency_ms": 45,
    "success": false
  },
  "result": {
    "status": "blocked",
    "summary": "Input validation failed",
    "primary_outputs": {
      "validation_errors": [
        "Missing required field: payload.schema_version",
        "Missing or invalid field: payload.tables (must be non-empty array)"
      ]
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [],
    "external_calls": []
  }
}
```

### Step 4: Verify Database Changes

```sql
-- 1. Check schema_migrations log
SELECT * FROM public.schema_migrations
ORDER BY applied_at DESC
LIMIT 5;

-- 2. Verify table exists
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'tenants';

-- 3. Verify columns (including auto-added defaults)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tenants'
ORDER BY ordinal_position;

-- Expected columns:
-- id (UUID, gen_random_uuid())
-- tenant_id (UUID, NOT NULL)
-- created_at (TIMESTAMPTZ, NOW())
-- updated_at (TIMESTAMPTZ, NOW())
-- deleted_at (TIMESTAMPTZ, nullable)
-- name (TEXT, NOT NULL)
-- status (TEXT, NOT NULL, 'active')

-- 4. Verify indexes (including auto-added defaults)
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'tenants';

-- Expected indexes:
-- idx_tenants_status (custom)
-- idx_tenants_tenant_id (auto-added)
-- idx_tenants_created_at (auto-added)

-- 5. Verify RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'tenants';
-- Expected: rowsecurity = true

-- 6. Verify RLS policy exists
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'tenants';
-- Expected: tenants_tenant_isolation policy
```

---

## Input Contract Reference

### Minimal Input (Default Envelope)
```json
{
  "payload": {
    "schema_version": "001",
    "description": "Foundation Schema",
    "tables": [
      {
        "name": "table_name",
        "columns": [
          {"name": "column_name", "type": "TEXT", "not_null": true}
        ],
        "indexes": [
          {"name": "idx_name", "columns": ["column_name"]}
        ]
      }
    ]
  }
}
```

### Full Orchestration Envelope
```json
{
  "meta": {
    "workflow_name": "WF106",
    "workflow_version": "2.0.0",
    "workflow_run_id": "wr_custom_12345",
    "idempotency_key": "idem_wf106_custom_key",
    "trigger_source": "webhook",
    "timestamp_utc": "2026-02-05T10:00:00.000Z",
    "tenant_id": "t_demo_practice_001",
    "environment": "prod"
  },
  "subject": {
    "tenant_id": "t_demo_practice_001"
  },
  "payload": {
    "schema_version": "001",
    "description": "Foundation Schema",
    "force_apply": false,
    "tables": [...]
  },
  "context": {
    "actor_id": "user_admin_001",
    "validation_profile": "safe"
  }
}
```

### Column Definition Schema
```json
{
  "name": "column_name",
  "type": "TEXT|INTEGER|UUID|TIMESTAMPTZ|JSONB|BOOLEAN|DATE|...",
  "primary_key": true|false,
  "not_null": true|false,
  "unique": true|false,
  "default": "value|gen_random_uuid()|NOW()",
  "references": "other_table(column)"
}
```

### Index Definition Schema
```json
{
  "name": "idx_table_column",
  "columns": ["column1", "column2"]
}
```

---

## Output Contract Reference

### Success Response (status: "applied")
```json
{
  "meta_out": {
    "workflow_name": "WF106",
    "workflow_run_id": "wr_...",
    "latency_ms": 3200,
    "success": true,
    "inputs_hash": "sha256_...",
    "outputs_hash": "sha256_..."
  },
  "result": {
    "status": "applied",
    "summary": "Applied schema v001: 10 tables created",
    "primary_outputs": {
      "schema_version": "001",
      "tables_created": 10,
      "indexes_created": 25,
      "migration_log_id": "uuid-...",
      "warnings": []
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [
      {"table": "schema_migrations", "record_id": "uuid-..."}
    ],
    "external_calls": [
      {"service": "supabase", "endpoint": "execute_sql", "latency_ms": 2800},
      {"service": "supabase", "endpoint": "insert_migration_log", "latency_ms": 150}
    ]
  }
}
```

### Idempotency Response (status: "noop")
```json
{
  "meta_out": {
    "workflow_name": "WF106",
    "workflow_run_id": "wr_...",
    "latency_ms": 150,
    "success": true,
    "inputs_hash": "sha256_..."
  },
  "result": {
    "status": "noop",
    "summary": "Schema version 001 already applied (idempotent)",
    "primary_outputs": {
      "schema_version": "001",
      "already_applied_at": "2026-02-05T10:15:23.456Z",
      "migration_log_id": "uuid-..."
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [],
    "external_calls": [
      {"service": "supabase", "endpoint": "query_schema_migrations", "latency_ms": 50}
    ]
  }
}
```

### Validation Failure (status: "blocked")
```json
{
  "meta_out": {
    "workflow_name": "WF106",
    "workflow_run_id": "wr_...",
    "latency_ms": 45,
    "success": false
  },
  "result": {
    "status": "blocked",
    "summary": "Input validation failed",
    "primary_outputs": {
      "validation_errors": [
        "Missing required field: payload.schema_version",
        "Missing or invalid field: payload.tables (must be non-empty array)"
      ]
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [],
    "external_calls": []
  }
}
```

---

## Auto-Added Features

### Default Columns (Added to Every Table)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
deleted_at TIMESTAMPTZ
```

### Default Indexes (Added to Every Table)
```sql
CREATE INDEX idx_{table}_tenant_id ON {table}(tenant_id);
CREATE INDEX idx_{table}_created_at ON {table}(created_at);
```

### Row-Level Security (Enabled on Every Table)
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY {table}_tenant_isolation
  ON {table}
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

---

## Idempotency Mechanism

### How It Works

1. **Idempotency Key Generation:**
   ```javascript
   const idempotency_key = `idem:wf106:${tenant_id}:${schema_version}:${schema_hash}`;
   ```

2. **Lookup in schema_migrations:**
   ```sql
   SELECT * FROM schema_migrations
   WHERE version = '{schema_version}'
   AND status = 'success'
   LIMIT 1;
   ```

3. **Decision:**
   - If record exists → Return `status: "noop"` (idempotent)
   - If no record → Proceed with migration

### Benefits

- **Safe Re-runs:** Can call WF106 multiple times without risk
- **Disaster Recovery:** If workflow crashes mid-execution, re-running with same version won't duplicate tables
- **CI/CD Integration:** Safe to include in automated deployment pipelines

---

## Error Handling

### Validation Errors (Caught Early)
- Missing required fields (schema_version, description, tables)
- Empty tables array
- Invalid table/column structure

**Response:** 400 Bad Request with validation_errors array

### SQL Execution Errors (Caught During Apply)
- Syntax errors in generated SQL
- Constraint violations
- Permission issues

**Response:** 500 Internal Server Error (n8n default error handling)

**Logged in schema_migrations:**
```sql
INSERT INTO schema_migrations (version, status, error_message)
VALUES ('001', 'failed', 'ERROR: syntax error at or near...');
```

---

## Security Features

### Multi-Tenant Isolation (RLS)
Every table automatically gets:
1. `tenant_id UUID NOT NULL` column
2. Row-Level Security enabled
3. Tenant isolation policy:
   ```sql
   USING (tenant_id::text = current_setting('app.current_tenant_id', true))
   ```

### SQL Injection Prevention
- All SQL generated from validated schema objects
- No user-provided SQL executed directly
- Parameterized column types and names

### Transaction Safety
All SQL wrapped in BEGIN/COMMIT:
```sql
BEGIN;
  -- All CREATE TABLE, CREATE INDEX, ALTER TABLE statements
COMMIT;
```
**Result:** All-or-nothing (if any step fails, entire migration rolls back)

---

## Monitoring & Debugging

### Check Workflow Execution History (n8n UI)
1. Open n8n → Workflows → WF106 v2.0
2. Click "Executions" tab
3. View recent runs (success/failure, duration, inputs/outputs)

### Query Migration Log (Supabase)
```sql
-- Recent migrations
SELECT version, description, status, applied_at, applied_by
FROM schema_migrations
ORDER BY applied_at DESC
LIMIT 20;

-- Failed migrations
SELECT version, description, error_message, applied_at
FROM schema_migrations
WHERE status = 'failed'
ORDER BY applied_at DESC;

-- Specific version history
SELECT *
FROM schema_migrations
WHERE version = '001'
ORDER BY applied_at DESC;
```

### Common Issues

**Issue 1: Workflow not activating**
- Check: Supabase credential configured in n8n
- Verify: schema_migrations table exists in Supabase

**Issue 2: Idempotency not working**
- Check: schema_migrations table has UNIQUE(version, status) constraint
- Verify: Query returns correct record count

**Issue 3: RLS policy errors**
- Check: pgcrypto extension enabled
- Verify: SQL syntax in generated policy (view in execution log)

---

## Next Steps (Phase 2)

### S3: Discover Current DB State
Add nodes to query information_schema:
- Get existing tables
- Get existing columns
- Get existing indexes
- Get existing RLS policies

### S4: Diff + Risk Gate
Compare target blueprint vs current state:
- Detect dangerous changes (DROP COLUMN, CHANGE TYPE)
- Block if warnings exist and force_apply=false
- Log blocked migrations

### S6: Verify (Smoke Tests)
After applying migration, verify:
- Tables exist
- Columns match blueprint
- Indexes created
- RLS enabled

### WF11 Integration
Replace stub with actual WF11 workflow call:
```json
{
  "event_type": "schema_migration_applied",
  "schema_version": "001",
  "tables_created": 10,
  "workflow_run_id": "wr_..."
}
```

---

## Changelog

### v2.0.0 (2026-02-05)
- ✅ Full Orchestration Convention compliance (meta/subject/payload/context)
- ✅ Idempotency checking via schema_migrations lookup
- ✅ Input validation with structured error array
- ✅ Auto-normalization (default columns + indexes)
- ✅ Enhanced SQL generation (transactions, IF NOT EXISTS, pgcrypto)
- ✅ RLS multi-tenant fence (auto-enabled on all tables)
- ✅ Migration logging with metadata
- ✅ WF11 event logging stub
- ✅ Standard output contract (meta_out/result/audit)

### v1.0.0 (2026-02-04)
- Basic webhook trigger
- JSON to SQL generation
- SQL execution
- Basic migration logging

---

**End of Implementation Guide**
