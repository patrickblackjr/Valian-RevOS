# WF106 - Schema Auto-Builder Workflow Design

**Version:** 2.0.0 (Orchestration Convention v1.0)
**Purpose:** Deploy database schemas to Supabase with idempotency, diff detection, and safety gates
**Trigger:** Webhook (POST /schema-builder)

---

## Orchestration Envelope Compliance

### Input Contract
```json
{
  "meta": {
    "workflow_name": "WF106",
    "workflow_version": "2.0.0",
    "workflow_run_id": "wr_...",
    "idempotency_key": "idem_wf106_{tenant}_{version}_{schema_hash}",
    "trigger_source": "webhook",
    "timestamp_utc": "2026-02-05T...",
    "tenant_id": "t_...",
    "environment": "prod"
  },
  "subject": {
    "tenant_id": "t_..."
  },
  "payload": {
    "schema_version": "001",
    "description": "Foundation Schema",
    "force_apply": false,
    "tables": [
      {
        "name": "table_name",
        "columns": [
          {"name": "id", "type": "UUID", "primary_key": true},
          {"name": "tenant_id", "type": "UUID", "not_null": true}
        ],
        "indexes": [
          {"name": "idx_name", "columns": ["col1", "col2"]}
        ]
      }
    ]
  },
  "context": {
    "actor_id": "system|user_id",
    "validation_profile": "safe|full"
  }
}
```

### Output Contract
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
    "status": "applied|noop|blocked|failed",
    "summary": "Applied schema v001: 10 tables created",
    "primary_outputs": {
      "schema_version": "001",
      "tables_created": 10,
      "indexes_created": 25,
      "migration_log_id": "ml_...",
      "warnings": []
    }
  },
  "audit": {
    "phi_touched": false,
    "data_written": [
      {"table": "schema_migrations", "record_id": "..."}
    ],
    "external_calls": [
      {"service": "supabase", "endpoint": "execute_sql", "latency_ms": 2800}
    ]
  }
}
```

---

## Node Flow (Detailed - ChatGPT Design)

### S0 - Trigger / Entry
**Node 0.1: Webhook_DB_Auto_Builder_In**
- Type: Webhook
- Path: `/wf106/db_auto_builder`
- Method: POST
- Response: "Respond at end"

### S1 - Envelope + Validation + Idempotency
**Node 1: Set_Envelope_Defaults**
- Sets orchestration envelope fields
- Extracts tenant_id, schema_version, desired_schema

**Node 2: Code_Normalize_Input**
- Validates required fields
- Normalizes table/column names to snake_case
- Adds default columns (id, tenant_id, created_at, updated_at, deleted_at)
- Ensures multi-tenant fence (tenant_id on all tables)
- Output: `core.normalized_schema`, `core.validation_ok`

**Node 3: IF_Invalid_Input**
- Checks validation_ok
- Returns 400 if invalid

**Node 4: Respond_Invalid**
- Returns blocked status with validation errors

**Node 5: Code_Build_Idempotency_Key**
- Key: `idem:wf106:{tenant_id}:{schema_version}:{sha256(normalized_schema)}`
- Output: `meta.idempotency_key`, `meta.inputs_hash`

**Node 6: PG_Idempotency_Lookup**
- Queries `schema_migrations` table
- Checks if schema already applied

**Node 7: IF_Already_Applied**
- Returns noop if schema exists

### S2 - Build Target Blueprint
**Node 9: Code_Build_Target_Schema_Blueprint**
- Converts normalized_schema to canonical blueprint
- Output: `core.blueprint` (tables, columns, indexes, RLS policies)

### S3 - Discover Current DB State
**Node 10-13: PG_Get_Current_State_***
- Queries information_schema for current state
- Gets columns, constraints, indexes, RLS policies

**Node 14: Code_Assemble_Current_Snapshot**
- Combines current state into snapshot

### S4 - Diff + Risk Gate
**Node 15: Code_Diff_Current_vs_Target**
- Computes differences
- Identifies dangerous changes (drop column, change type, drop policy)
- Output: `diff.create_tables[]`, `diff.warnings[]`

**Node 16: IF_Block_Dangerous_Changes**
- Blocks if warnings exist and force_apply is false

**Node 17: PG_Write_Migration_Log_Blocked**
- Logs blocked migration

**Node 18: Respond_Blocked**
- Returns blocked status with warnings

### S5 - Generate SQL Migration
**Node 19: Code_Generate_SQL_Migration**
- Generates SQL in single transaction:
  ```sql
  BEGIN;
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  CREATE TABLE IF NOT EXISTS ...;
  CREATE INDEX IF NOT EXISTS ...;
  ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
  CREATE POLICY ...;
  COMMIT;
  ```

**Node 20: PG_Execute_SQL**
- Executes migration SQL
- Fails hard on error

### S6 - Verify (Smoke Tests)
**Node 21-23: PG_Smoke_Test_***
- Verifies tables, columns, RLS, indexes exist

**Node 24: Code_Verify_Result**
- Checks verification results

**Node 25: IF_Verify_Failed**
- Handles verification failure

### S7 - Log + Return
**Node 28: PG_Write_Migration_Log_Applied**
- Inserts success record to schema_migrations

**Node 29: Execute_WF11_Log_Event**
- Logs event via WF11

**Node 30: Respond_Applied**
- Returns success with orchestration envelope

---

## Safety Features

1. **Idempotency:** Never applies same schema twice
2. **Diff Detection:** Only executes necessary changes
3. **Risk Gates:** Blocks dangerous operations unless force_apply=true
4. **Verification:** Smoke tests confirm schema applied correctly
5. **Transactions:** All changes in single transaction (all-or-nothing)
6. **Multi-Tenant Fence:** Every table includes tenant_id with RLS
7. **Audit Trail:** Every migration logged in schema_migrations

---

## Current Implementation (v1.0)

**What's Working:**
- ✅ Basic webhook trigger
- ✅ JSON to SQL generation
- ✅ SQL execution
- ✅ Migration logging
- ✅ Success response

**Missing (needs v2.0 upgrade):**
- ❌ Orchestration envelope
- ❌ Idempotency checking
- ❌ Diff detection
- ❌ Risk gates
- ❌ Verification smoke tests
- ❌ WF11 event logging
- ❌ Full output contract

---

## Upgrade Path

**Phase 1 (Next):**
1. Add orchestration envelope wrapper
2. Add idempotency check
3. Add WF11 logging
4. Add output contract

**Phase 2 (Later):**
1. Add diff detection
2. Add risk gates
3. Add verification
4. Add full ChatGPT design features

---

**Status:** v1.0 Working, v2.0 Design Complete
