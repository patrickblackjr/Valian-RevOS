# WF106 v2.0 - Schema Auto-Builder

**Status:** ✅ Ready for Deployment
**Version:** 2.0.0 (Orchestration Convention Compliant)
**Date:** 2026-02-05

---

## 🎯 Quick Start

### 1. Import Workflow (1 min)
```bash
# Via n8n UI
1. Open https://valiansystems.app.n8n.cloud/
2. Click "Add workflow" → "Import from file"
3. Select WF106_v2_Schema_Builder.json
4. Save & Activate
```

### 2. Test Minimal Payload (2 min)
```bash
# Replace with your actual webhook URL
export WEBHOOK_URL="https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2"

curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "schema_version": "001",
      "description": "Foundation Schema - Test",
      "tables": [
        {
          "name": "tenants",
          "columns": [
            {"name": "name", "type": "TEXT", "not_null": true}
          ]
        }
      ]
    }
  }'
```

### 3. Run Automated Tests (5 min)
```bash
cd /Users/patrick.black/code/Valian/workflows
./test_wf106_v2.sh $WEBHOOK_URL
```

---

## 📁 Package Contents

| File | Purpose |
|------|---------|
| `WF106_v2_Schema_Builder.json` | **n8n workflow definition** (14 nodes) - Import this |
| `WF106_v2_IMPLEMENTATION_GUIDE.md` | **Step-by-step deployment guide** - Read this first |
| `WF106_v2_TEST_PAYLOADS.json` | **7 test cases** - Use for manual testing |
| `WF106_v2_ARCHITECTURE.md` | **Visual diagrams** - Understand the flow |
| `WF106_v2_SUMMARY.md` | **Complete overview** - Executive summary |
| `WF106_DESIGN.md` | **Full design spec** - Technical deep-dive |
| `test_wf106_v2.sh` | **Automated test script** - Run all tests |
| `WF106_v2_README.md` | **This file** - Quick reference |

---

## 🚀 What It Does

WF106 v2.0 automatically deploys database schemas to Supabase with:

✅ **Orchestration Convention compliance** (meta/subject/payload/context)
✅ **Idempotency** (never applies same schema twice)
✅ **Auto-normalization** (adds id, tenant_id, timestamps automatically)
✅ **Multi-tenant fence** (RLS enabled on all tables)
✅ **Input validation** (catches errors before execution)
✅ **Transaction safety** (all-or-nothing migrations)
✅ **Audit trail** (logs every migration to schema_migrations table)

---

## 📋 Phase 1 Features (Day 1 MVP)

| Feature | Status | Benefit |
|---------|--------|---------|
| Orchestration Envelope | ✅ Complete | Standard input/output contract |
| Idempotency Checking | ✅ Complete | Safe to re-run, no duplicates |
| Input Validation | ✅ Complete | Clear error messages |
| Auto-Normalization | ✅ Complete | Consistent multi-tenant schema |
| SQL Safety | ✅ Complete | Transactions, IF NOT EXISTS |
| RLS Multi-Tenant Fence | ✅ Complete | Enforced data isolation |
| Migration Logging | ✅ Complete | Full audit trail |
| WF11 Event Stub | ✅ Complete | Ready for integration |
| Output Contract | ✅ Complete | meta_out/result/audit |

---

## 📋 Phase 2 Features (Deferred)

| Feature | Status | Target |
|---------|--------|--------|
| Diff Detection | ⏳ Pending | Month 2 |
| Risk Gates | ⏳ Pending | Month 2 |
| Verification Tests | ⏳ Pending | Month 2 |
| WF11 Full Integration | ⏳ Pending | Month 2 |

---

## 🧪 Testing

### Automated Test Suite
```bash
# Run all 7 tests
./test_wf106_v2.sh https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2

# Expected output:
# ✅ TEST 1: Minimal Input - PASSED
# ✅ TEST 2: Full Envelope - PASSED
# ✅ TEST 3: Idempotency - PASSED
# ✅ TEST 4: Missing Version - PASSED
# ✅ TEST 5: Empty Tables - PASSED
# ✅ TEST 6: Complex Schema - PASSED
# ✅ TEST 7: Normalization - PASSED
#
# Total Tests: 7
# Passed: 7
# Failed: 0
```

### Manual Test Cases

See `WF106_v2_TEST_PAYLOADS.json` for:
- TEST 1: Minimal input (default envelope)
- TEST 2: Full orchestration envelope
- TEST 3: Idempotency check
- TEST 4: Validation failure (missing version)
- TEST 5: Validation failure (empty tables)
- TEST 6: Complex multi-table schema
- TEST 7: Column name normalization

---

## 📊 Example Input/Output

### Minimal Input
```json
{
  "payload": {
    "schema_version": "001",
    "description": "Foundation Schema",
    "tables": [
      {
        "name": "tenants",
        "columns": [
          {"name": "name", "type": "TEXT", "not_null": true}
        ]
      }
    ]
  }
}
```

### Output (Success)
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
      {"service": "supabase", "endpoint": "execute_sql", "latency_ms": 2800}
    ]
  }
}
```

---

## 🔍 Verification

### Check Migration Log
```sql
SELECT version, description, status, applied_at
FROM public.schema_migrations
ORDER BY applied_at DESC
LIMIT 10;
```

### Verify Table Created
```sql
-- Check table exists
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'tenants';
-- Expected: rowsecurity = true

-- Check columns (including auto-added)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tenants'
ORDER BY ordinal_position;
-- Expected columns: id, tenant_id, created_at, updated_at, deleted_at, name

-- Check indexes (including auto-added)
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'tenants';
-- Expected indexes: idx_tenants_tenant_id, idx_tenants_created_at, ...
```

---

## 🛠 Auto-Added Features

Every table automatically gets:

### Default Columns
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `tenant_id UUID NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `deleted_at TIMESTAMPTZ` (soft delete)

### Default Indexes
- `idx_{table}_tenant_id ON {table}(tenant_id)`
- `idx_{table}_created_at ON {table}(created_at)`

### Row-Level Security
- `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY`
- `CREATE POLICY {table}_tenant_isolation ON {table} FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true))`

---

## ⚠️ Known Limitations (Phase 1)

1. **No Diff Detection** - Doesn't check current DB state before applying
   - Workaround: Use unique schema versions
   - Fix: Phase 2 (S3 nodes)

2. **No Risk Gates** - Dangerous changes (DROP COLUMN) not blocked
   - Workaround: Review SQL before applying
   - Fix: Phase 2 (S4 nodes)

3. **No Verification** - Doesn't verify tables created correctly after migration
   - Workaround: Manual SQL verification
   - Fix: Phase 2 (S6 nodes)

4. **WF11 Event Logging is Stub** - Events not sent to WF11
   - Workaround: Check schema_migrations table directly
   - Fix: Month 2 (replace Node 12)

---

## 📚 Documentation

### Quick Reference
- **This file** - Quick start and overview

### Detailed Guides
- **WF106_v2_IMPLEMENTATION_GUIDE.md** - Full deployment guide
- **WF106_v2_ARCHITECTURE.md** - Visual flow diagrams
- **WF106_v2_SUMMARY.md** - Complete feature overview
- **WF106_DESIGN.md** - Technical design specification

### Testing
- **WF106_v2_TEST_PAYLOADS.json** - 7 test cases
- **test_wf106_v2.sh** - Automated test script

---

## 🎓 How It Works

### Happy Path Flow
```
1. Webhook receives payload
2. Normalize input + add default columns
3. Validate required fields
4. Build idempotency key
5. Check if schema already applied
   ├─ If yes → Return "noop" (200)
   └─ If no → Continue
6. Generate SQL (CREATE TABLE, indexes, RLS)
7. Execute SQL in transaction
8. Log migration to schema_migrations
9. Log event (stub for WF11)
10. Return "applied" (200)
```

### Idempotency Mechanism
```
Idempotency Key = idem:wf106:{tenant_id}:{version}:{schema_hash}

Query: SELECT * FROM schema_migrations WHERE version = '{version}' AND status = 'success'

If record exists → Skip (noop)
If no record → Apply migration
```

### Auto-Normalization
```
Input:
{
  "name": "patients",
  "columns": [
    {"name": "first_name", "type": "TEXT"}
  ]
}

Normalized (auto-added):
{
  "name": "patients",
  "columns": [
    {"name": "id", "type": "UUID", "primary_key": true, "default": "gen_random_uuid()"},
    {"name": "tenant_id", "type": "UUID", "not_null": true},
    {"name": "created_at", "type": "TIMESTAMPTZ", "not_null": true, "default": "NOW()"},
    {"name": "updated_at", "type": "TIMESTAMPTZ", "not_null": true, "default": "NOW()"},
    {"name": "deleted_at", "type": "TIMESTAMPTZ"},
    {"name": "first_name", "type": "TEXT"}
  ],
  "indexes": [
    {"name": "idx_patients_tenant_id", "columns": ["tenant_id"]},
    {"name": "idx_patients_created_at", "columns": ["created_at"]}
  ]
}
```

---

## 🚨 Troubleshooting

### Issue: Workflow not activating
**Check:**
- Supabase credential configured in n8n
- schema_migrations table exists in Supabase

**Fix:**
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

### Issue: Idempotency not working
**Check:**
- schema_migrations table has UNIQUE(version, status) constraint
- Query returns correct record count

**Debug:**
```sql
SELECT version, status, COUNT(*)
FROM schema_migrations
GROUP BY version, status
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### Issue: Test script fails
**Check:**
- Webhook URL is correct and active
- jq installed (for JSON parsing)
  ```bash
  brew install jq  # macOS
  ```
- Internet connection stable

---

## 📞 Support

**For Issues:**
- Check n8n execution log: https://valiansystems.app.n8n.cloud/workflows
- Check Supabase logs: https://vjnvddebjrrcgrapuhvn.supabase.co
- Review test payloads: `WF106_v2_TEST_PAYLOADS.json`
- Consult architecture diagrams: `WF106_v2_ARCHITECTURE.md`

**For Questions:**
- Implementation: See `WF106_v2_IMPLEMENTATION_GUIDE.md`
- Design rationale: See `WF106_DESIGN.md`
- Testing: See `WF106_v2_TEST_PAYLOADS.json`

---

## ✅ Deployment Checklist

- [ ] Import WF106_v2_Schema_Builder.json to n8n
- [ ] Activate workflow
- [ ] Verify webhook URL generated
- [ ] Run automated test script (all 7 tests pass)
- [ ] Verify schema_migrations table populated
- [ ] Verify tables created with RLS enabled
- [ ] Document webhook URL for future use

---

## 🎉 Success Criteria

**Phase 1 MVP Complete When:**

✅ WF106 v2.0 deployed and activated
✅ All 7 automated tests passing
✅ Idempotency working (re-apply returns noop)
✅ Validation working (invalid input returns 400)
✅ Auto-normalization working (default columns added)
✅ RLS enabled on all tables
✅ Migration log accurate

---

**Version:** 2.0.0
**Status:** ✅ Production Ready (Phase 1 MVP)
**Last Updated:** 2026-02-05

**Ready for Deployment** 🚀
