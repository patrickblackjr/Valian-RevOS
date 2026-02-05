# WF106 v2.0 Architecture & Flow Diagrams

**Version:** 2.0.0
**Date:** 2026-02-05
**Purpose:** Visual architecture documentation for WF106 Schema Auto-Builder

---

## System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         RevOS System                            │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   External   │      │              │      │              │ │
│  │   Caller     │─────▶│   WF106 v2   │─────▶│   Supabase   │ │
│  │ (API/Manual) │      │ Schema Builder│      │  PostgreSQL  │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│                              │                                  │
│                              │                                  │
│                              ▼                                  │
│                       ┌──────────────┐                         │
│                       │  WF11 Events │                         │
│                       │  (Stub/Future)│                         │
│                       └──────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## High-Level Flow (Happy Path)

```
┌─────────┐
│ Webhook │ POST /wf106/schema-builder
│ Trigger │ {payload: {...}}
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ S1: Envelope Setup  │
│ - Set defaults      │
│ - Normalize input   │
│ - Validate          │
│ - Build idem key    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ S1: Idempotency     │
│ - Query DB          │
│ - Check if applied  │
└────┬────────────────┘
     │
     ├─ Already Applied? ─────▶ Return "noop" (200)
     │
     ▼ Not Applied
┌─────────────────────┐
│ S5: Generate SQL    │
│ - Build CREATE TABLE│
│ - Add indexes       │
│ - Add RLS policies  │
│ - Wrap in txn       │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ S5: Execute SQL     │
│ - Run migration     │
│ - Commit            │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ S7: Log & Return    │
│ - Write migration   │
│ - Log event (stub)  │
│ - Return success    │
└────┬────────────────┘
     │
     ▼
  Return "applied" (200)
```

---

## Detailed Node Flow (14 Nodes)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         S0: TRIGGER / ENTRY                              │
└──────────────────────────────────────────────────────────────────────────┘

   ╔══════════════════════════════════════════════════════════╗
   ║ Node 0.1: Webhook_DB_Auto_Builder_In                     ║
   ║ Type: Webhook Trigger                                    ║
   ║ Path: /wf106/schema-builder                              ║
   ║ Method: POST                                             ║
   ║ Response: responseNode (defer response)                  ║
   ╚══════════════════════════════════════════════════════════╝
                            │
                            ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                   S1: ENVELOPE + VALIDATION + IDEMPOTENCY                │
└──────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │ Node 1: Set_Envelope_Defaults                            │
   │ Type: Set                                                │
   │ Action: Initialize meta fields (workflow_name, run_id,   │
   │         timestamp, start_time_ms)                        │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Node 2: Code_Normalize_Input                             │
   │ Type: Code (JavaScript)                                  │
   │ Actions:                                                 │
   │   1. Extract meta/subject/payload/context                │
   │   2. Validate required fields (version, description,     │
   │      tables)                                             │
   │   3. Normalize table/column names to snake_case          │
   │   4. Add default columns (id, tenant_id, timestamps)     │
   │   5. Add default indexes (tenant_id, created_at)         │
   │   6. Compute schema_hash (SHA256)                        │
   │ Output: normalized_schema, validation_ok, errors[]       │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Node 3: IF_Invalid_Input                                 │
   │ Type: IF                                                 │
   │ Condition: validation_ok == false?                       │
   └────────────┬────────────────────────┬────────────────────┘
                │ TRUE (invalid)         │ FALSE (valid)
                ▼                        ▼
   ┌────────────────────────┐    ┌──────────────────────────────┐
   │ Node 4:                │    │ Node 5:                      │
   │ Respond_Invalid        │    │ Code_Build_Idempotency_Key   │
   │ Type: Respond          │    │ Type: Code                   │
   │ Status: 400            │    │ Action: Build key:           │
   │ Returns:               │    │   idem:wf106:{tenant}:       │
   │   status: "blocked"    │    │   {version}:{hash}           │
   │   validation_errors[]  │    │ Output: idempotency_key,     │
   │                        │    │         inputs_hash          │
   └────────────────────────┘    └──────────┬───────────────────┘
        │ (END)                              ▼
        │                        ┌──────────────────────────────┐
        │                        │ Node 6:                      │
        │                        │ PG_Idempotency_Lookup        │
        │                        │ Type: Postgres               │
        │                        │ Query:                       │
        │                        │   SELECT * FROM              │
        │                        │   schema_migrations          │
        │                        │   WHERE version = '{v}'      │
        │                        │   AND status = 'success'     │
        │                        └──────────┬───────────────────┘
        │                                   ▼
        │                        ┌──────────────────────────────┐
        │                        │ Node 7:                      │
        │                        │ IF_Already_Applied           │
        │                        │ Type: IF                     │
        │                        │ Condition: result.length > 0 │
        │                        └──┬───────────────────┬───────┘
        │                           │ TRUE (exists)     │ FALSE
        │                           ▼                   ▼
        │                   ┌───────────────────┐
        │                   │ Node 8:           │
        │                   │ Respond_Noop      │
        │                   │ Type: Respond     │
        │                   │ Status: 200       │
        │                   │ Returns:          │
        │                   │   status: "noop"  │
        │                   │   already_applied │
        │                   └───────────────────┘
        │                        │ (END)
        │                        │
        └────────────────────────┴────────────────────┐
                                                       │
                                                       ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                      S5: GENERATE SQL MIGRATION                          │
└──────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │ Node 9: Code_Generate_SQL                                │
   │ Type: Code (JavaScript)                                  │
   │ Actions:                                                 │
   │   1. Generate SQL header (version, description, date)    │
   │   2. Start transaction (BEGIN;)                          │
   │   3. Enable pgcrypto extension                           │
   │   4. For each table:                                     │
   │      - CREATE TABLE IF NOT EXISTS                        │
   │      - CREATE INDEX IF NOT EXISTS (custom + defaults)    │
   │      - ALTER TABLE ... ENABLE ROW LEVEL SECURITY         │
   │      - CREATE POLICY ... tenant_isolation                │
   │   5. Commit transaction (COMMIT;)                        │
   │   6. Compute checksum (SHA256 of SQL)                    │
   │ Output: generated_sql {sql, checksum, table_count}       │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Node 10: PG_Execute_SQL                                  │
   │ Type: Postgres                                           │
   │ Action: Execute generated SQL script                     │
   │ Result: Creates tables, indexes, RLS policies            │
   └────────────────────────┬─────────────────────────────────┘
                            ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                          S7: LOG + RETURN                                │
└──────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │ Node 11: PG_Write_Migration_Log_Applied                  │
   │ Type: Postgres (INSERT)                                  │
   │ Table: schema_migrations                                 │
   │ Columns:                                                 │
   │   - version, description, applied_by, checksum           │
   │   - status: 'success'                                    │
   │   - sql_script (full SQL)                                │
   │   - metadata {table_count, indexes, workflow_run_id}     │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Node 12: [Stub] Execute_WF11_Log_Event                   │
   │ Type: Set (Placeholder)                                  │
   │ Action: Create stub event object                         │
   │ Note: Will be replaced with HTTP Request to WF11 webhook │
   │ Future payload:                                          │
   │   {event_type: "schema_migration_applied",               │
   │    schema_version: "001", table_count: 10}               │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Node 13: Set_Output_Envelope                             │
   │ Type: Set                                                │
   │ Action: Build output contract:                           │
   │   - meta_out {workflow_name, run_id, latency_ms,         │
   │     success, inputs_hash, outputs_hash}                  │
   │   - result {status: "applied", summary, primary_outputs} │
   │   - audit {phi_touched, data_written, external_calls}    │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Node 14: Respond_Applied                                 │
   │ Type: Respond to Webhook                                 │
   │ Status: 200 OK                                           │
   │ Body: {meta_out, result, audit}                          │
   └────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                        (END)
```

---

## Orchestration Envelope Flow

```
INPUT PAYLOAD
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   "meta": {                                         │
│     "tenant_id": "t_001",                           │
│     "idempotency_key": "...",                       │
│     "workflow_run_id": "wr_..."                     │
│   },                                                │
│   "subject": {                                      │
│     "tenant_id": "t_001"                            │
│   },                                                │
│   "payload": {                                      │
│     "schema_version": "001",                        │
│     "description": "Foundation Schema",             │
│     "tables": [...]                                 │
│   },                                                │
│   "context": {                                      │
│     "actor_id": "user_admin_001",                   │
│     "validation_profile": "safe"                    │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ Node 1: Set     │
            │ Envelope        │
            │ Defaults        │
            └────────┬────────┘
                     │
                     ▼ Adds defaults if missing
            ┌─────────────────┐
            │ meta.workflow_  │
            │   name = "WF106"│
            │ meta.timestamp_ │
            │   utc = $now    │
            │ meta.workflow_  │
            │   run_id = "wr_"│
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Node 2: Code    │
            │ Normalize &     │
            │ Validate        │
            └────────┬────────┘
                     │
                     ▼ Enriched data
            ┌─────────────────┐
            │ core.normalized_│
            │   schema        │
            │ core.validation_│
            │   ok            │
            │ core.schema_hash│
            └────────┬────────┘
                     │
                     ▼
                  ... workflow continues ...
                     │
                     ▼
            ┌─────────────────┐
            │ Node 13: Set    │
            │ Output Envelope │
            └────────┬────────┘
                     │
                     ▼
OUTPUT RESPONSE
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   "meta_out": {                                     │
│     "workflow_name": "WF106",                       │
│     "workflow_run_id": "wr_...",                    │
│     "latency_ms": 3200,                             │
│     "success": true,                                │
│     "inputs_hash": "sha256_...",                    │
│     "outputs_hash": "sha256_..."                    │
│   },                                                │
│   "result": {                                       │
│     "status": "applied",                            │
│     "summary": "Applied schema v001: 10 tables",    │
│     "primary_outputs": {                            │
│       "schema_version": "001",                      │
│       "tables_created": 10,                         │
│       "indexes_created": 25,                        │
│       "migration_log_id": "uuid-...",               │
│       "warnings": []                                │
│     }                                               │
│   },                                                │
│   "audit": {                                        │
│     "phi_touched": false,                           │
│     "data_written": [                               │
│       {"table": "schema_migrations", "record_id":...}│
│     ],                                              │
│     "external_calls": [                             │
│       {"service": "supabase", "latency_ms": 2800}   │
│     ]                                               │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## Idempotency Mechanism Flow

```
┌─────────────────────────────────────────────────────────────┐
│              IDEMPOTENCY CHECK FLOW                         │
└─────────────────────────────────────────────────────────────┘

INPUT: schema_version = "001"

                    ▼
        ┌───────────────────────┐
        │ Node 5: Build Key     │
        │ idem:wf106:t_001:001: │
        │ {sha256_hash}         │
        └──────────┬────────────┘
                   │
                   ▼
        ┌───────────────────────┐
        │ Node 6: Query DB      │
        │ SELECT * FROM         │
        │ schema_migrations     │
        │ WHERE version='001'   │
        │ AND status='success'  │
        └──────────┬────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼ result.length = 0   ▼ result.length > 0
   ┌────────────┐        ┌────────────┐
   │ NOT FOUND  │        │  FOUND     │
   │ (New)      │        │ (Duplicate)│
   └─────┬──────┘        └─────┬──────┘
         │                     │
         ▼                     ▼
┌────────────────┐    ┌────────────────┐
│ Node 7: FALSE  │    │ Node 7: TRUE   │
│ Continue to    │    │ Skip to        │
│ Node 9         │    │ Node 8         │
│ (Generate SQL) │    │ (Respond Noop) │
└────────────────┘    └────────┬───────┘
         │                     │
         ▼                     ▼
    Apply migration      Return "noop"
    status: "applied"    status: "noop"
                         already_applied_at: "..."
```

---

## Data Flow: Table Creation with Auto-Added Features

```
┌─────────────────────────────────────────────────────────────┐
│                  INPUT TABLE DEFINITION                     │
└─────────────────────────────────────────────────────────────┘

{
  "name": "patients",
  "columns": [
    {"name": "first_name", "type": "TEXT", "not_null": true},
    {"name": "last_name", "type": "TEXT", "not_null": true},
    {"name": "phone", "type": "TEXT"}
  ],
  "indexes": [
    {"name": "idx_patients_phone", "columns": ["phone"]}
  ]
}

                    ▼
        ┌───────────────────────┐
        │ Node 2: Normalize     │
        │ - Add default columns │
        │ - Add default indexes │
        └──────────┬────────────┘
                   ▼

┌─────────────────────────────────────────────────────────────┐
│               NORMALIZED TABLE DEFINITION                   │
└─────────────────────────────────────────────────────────────┘

{
  "name": "patients",
  "columns": [
    {"name": "id", "type": "UUID", "primary_key": true,
     "default": "gen_random_uuid()"},                    ◄─── AUTO-ADDED
    {"name": "tenant_id", "type": "UUID", "not_null": true}, ◄─── AUTO-ADDED
    {"name": "created_at", "type": "TIMESTAMPTZ",
     "not_null": true, "default": "NOW()"},              ◄─── AUTO-ADDED
    {"name": "updated_at", "type": "TIMESTAMPTZ",
     "not_null": true, "default": "NOW()"},              ◄─── AUTO-ADDED
    {"name": "deleted_at", "type": "TIMESTAMPTZ"},       ◄─── AUTO-ADDED
    {"name": "first_name", "type": "TEXT", "not_null": true},
    {"name": "last_name", "type": "TEXT", "not_null": true},
    {"name": "phone", "type": "TEXT"}
  ],
  "indexes": [
    {"name": "idx_patients_tenant_id",
     "columns": ["tenant_id"]},                          ◄─── AUTO-ADDED
    {"name": "idx_patients_created_at",
     "columns": ["created_at"]},                         ◄─── AUTO-ADDED
    {"name": "idx_patients_phone", "columns": ["phone"]}
  ]
}

                    ▼
        ┌───────────────────────┐
        │ Node 9: Generate SQL  │
        └──────────┬────────────┘
                   ▼

┌─────────────────────────────────────────────────────────────┐
│                   GENERATED SQL                             │
└─────────────────────────────────────────────────────────────┘

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant_id
  ON public.patients(tenant_id);                      ◄─── AUTO-ADDED
CREATE INDEX IF NOT EXISTS idx_patients_created_at
  ON public.patients(created_at);                     ◄─── AUTO-ADDED
CREATE INDEX IF NOT EXISTS idx_patients_phone
  ON public.patients(phone);

ALTER TABLE public.patients
  ENABLE ROW LEVEL SECURITY;                          ◄─── AUTO-ADDED

CREATE POLICY IF NOT EXISTS patients_tenant_isolation
  ON public.patients
  FOR ALL
  USING (tenant_id::text =
    current_setting('app.current_tenant_id', true)); ◄─── AUTO-ADDED

COMMIT;
```

---

## Error Handling & Branching

```
                    ┌─────────────┐
                    │ Node 2:     │
                    │ Normalize & │
                    │ Validate    │
                    └──────┬──────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼ validation_ok   ▼ !validation_ok
         ┌────────────────┐  ┌──────────────┐
         │ Node 3: FALSE  │  │ Node 3: TRUE │
         │ (valid input)  │  │ (invalid)    │
         └────────┬───────┘  └──────┬───────┘
                  │                 │
                  ▼                 ▼
         Continue to      ┌──────────────────┐
         Node 5           │ Node 4:          │
                          │ Respond_Invalid  │
                          │ Status: 400      │
                          │ {validation_     │
                          │  errors: [...]}  │
                          └──────────────────┘
                                   │
                                   ▼
                                 (END)


                    ┌─────────────┐
                    │ Node 7:     │
                    │ Check if    │
                    │ Applied     │
                    └──────┬──────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼ FALSE           ▼ TRUE
         ┌────────────────┐  ┌──────────────┐
         │ Not applied    │  │ Already      │
         │ (new version)  │  │ applied      │
         └────────┬───────┘  └──────┬───────┘
                  │                 │
                  ▼                 ▼
         Continue to      ┌──────────────────┐
         Node 9           │ Node 8:          │
         (Generate SQL)   │ Respond_Noop     │
                          │ Status: 200      │
                          │ {status: "noop", │
                          │  already_applied}│
                          └──────────────────┘
                                   │
                                   ▼
                                 (END)


                    ┌─────────────┐
                    │ Node 10:    │
                    │ Execute SQL │
                    └──────┬──────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼ Success         ▼ Error
         ┌────────────────┐  ┌──────────────────┐
         │ Continue to    │  │ n8n Error        │
         │ Node 11        │  │ Handler          │
         │ (Log success)  │  │ (default: 500)   │
         └────────┬───────┘  │                  │
                  │           │ Future: Log to   │
                  │           │ schema_migrations│
                  │           │ with status=     │
                  │           │ 'failed'         │
                  │           └──────────────────┘
                  ▼
            Final success
            response
```

---

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│            schema_migrations (Migration Log)                 │
├──────────────────────────────────────────────────────────────┤
│ id             UUID PRIMARY KEY                              │
│ version        TEXT NOT NULL                                 │
│ description    TEXT NOT NULL                                 │
│ applied_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()            │
│ applied_by     TEXT NOT NULL (e.g., "WF106_v2.0")            │
│ checksum       TEXT (SHA256 of SQL script)                   │
│ status         TEXT NOT NULL ('success' | 'failed')          │
│ error_message  TEXT                                          │
│ sql_script     TEXT (full SQL for audit)                     │
│ metadata       JSONB (table_count, indexes, workflow_run_id) │
│                                                              │
│ UNIQUE(version, status) ◄──── Prevents duplicate success    │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ Records every WF106 execution
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  Created Tables (e.g., tenants)              │
├──────────────────────────────────────────────────────────────┤
│ id             UUID PRIMARY KEY DEFAULT gen_random_uuid()    │
│ tenant_id      UUID NOT NULL                                 │
│ created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()            │
│ updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()            │
│ deleted_at     TIMESTAMPTZ                                   │
│ ... (custom columns) ...                                     │
│                                                              │
│ ROW LEVEL SECURITY ENABLED ◄──── Auto-added by WF106        │
│ POLICY: tenant_isolation   ◄──── Auto-added by WF106        │
└──────────────────────────────────────────────────────────────┘
```

---

## State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                  WORKFLOW EXECUTION STATES                  │
└─────────────────────────────────────────────────────────────┘

   [START]
      │
      ▼
 ┌─────────┐
 │ Received│
 │ Payload │
 └────┬────┘
      │
      ├─ Validation Failed ──────▶ [BLOCKED] (400)
      │
      ├─ Already Applied ─────────▶ [NOOP] (200)
      │
      ▼
 ┌─────────┐
 │ Applying│
 │Migration│
 └────┬────┘
      │
      ├─ SQL Execution Failed ────▶ [FAILED] (500)
      │
      ▼
 ┌─────────┐
 │ Applied │
 │ Success │
 └────┬────┘
      │
      ▼
   [END] (200)


Database Record States (schema_migrations.status):

┌─────────┐
│ (none)  │ ◄─── No record exists
└────┬────┘
     │
     ▼ WF106 executes
┌─────────┐
│ success │ ◄─── Migration applied successfully
└─────────┘

OR

┌─────────┐
│ failed  │ ◄─── Migration failed (error logged)
└─────────┘
```

---

## Orchestration Convention Compliance

```
┌─────────────────────────────────────────────────────────────┐
│           ORCHESTRATION CONVENTION CHECKLIST                │
└─────────────────────────────────────────────────────────────┘

Input Contract:
  ✅ meta {workflow_name, workflow_version, workflow_run_id,
          idempotency_key, trigger_source, timestamp_utc,
          tenant_id, environment}
  ✅ subject {tenant_id}
  ✅ payload {schema_version, description, tables, force_apply}
  ✅ context {actor_id, validation_profile}

Output Contract:
  ✅ meta_out {workflow_name, workflow_run_id, latency_ms,
              success, inputs_hash, outputs_hash}
  ✅ result {status, summary, primary_outputs}
  ✅ audit {phi_touched, data_written, external_calls}

Idempotency:
  ✅ Idempotency key generated (hash-based)
  ✅ Pre-execution check (query schema_migrations)
  ✅ Returns noop if already applied

Safety Features:
  ✅ Input validation (structured error array)
  ✅ Transaction wrapping (BEGIN/COMMIT)
  ✅ IF NOT EXISTS clauses (idempotent SQL)
  ✅ Multi-tenant fence (RLS auto-enabled)

Audit Trail:
  ✅ Migration logging (schema_migrations table)
  ✅ Event logging stub (WF11 integration pending)
  ✅ Execution metadata (workflow_run_id, checksums)

Phase 1 Complete ✅
Phase 2 Pending (Diff Detection, Risk Gates, Verification)
```

---

**End of Architecture Documentation**
