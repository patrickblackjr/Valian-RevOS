# RevOS Infrastructure Cleanup Checklist

**Date:** 2026-02-05 08:20 UTC
**Purpose:** Remove duplicate workflows and unused credentials for clean infrastructure

---

## 📋 Cleanup Tasks

### ✅ Task 1: Create `schema_migrations` Table in Supabase

**Status:** READY TO RUN

**Action:**
1. Go to: https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn/sql/new
2. Copy/paste the SQL below
3. Click "Run"

**SQL:**
```sql
-- RevOS: Schema Migrations Table
-- This table tracks all database schema changes applied by WF106

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by TEXT NOT NULL DEFAULT 'WF106',
  checksum TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'failed', 'rolled_back')),
  sql_script TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version
  ON public.schema_migrations(version);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at
  ON public.schema_migrations(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_status
  ON public.schema_migrations(status);

-- Comment
COMMENT ON TABLE public.schema_migrations IS
  'Tracks all schema migrations applied by WF106 Schema Auto-Builder';

-- Verify creation
SELECT
  'Table created successfully' AS status,
  COUNT(*) AS existing_migrations
FROM public.schema_migrations;
```

**Expected Result:** "Table created successfully | 0"

---

### ✅ Task 2: Test WF106

**Status:** READY TO RUN (after Task 1 complete)

**Command:**
```bash
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/wf106/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"test-002","description":"Test after schema_migrations table","tables":[{"name":"test_success","columns":[{"name":"message","type":"TEXT"}]}]}}'
```

**Expected Response:**
```json
{
  "result": {
    "status": "applied",
    "version": "test-002",
    "tables_created": 1
  }
}
```

**Verify in Supabase SQL Editor:**
```sql
-- Check if test table was created
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'test_success';

-- Check migration log
SELECT version, description, status, applied_at
FROM public.schema_migrations
ORDER BY applied_at DESC;
```

---

### ❌ Task 3: Delete Old WF103 Workflow

**Status:** READY TO DELETE

**Duplicate Workflows Found:**

| Status | Workflow ID | Name | Active | Last Updated |
|--------|-------------|------|--------|--------------|
| ❌ **DELETE** | `4gpdeqt57NKyJY01` | WF103 - GitHub Auto-Export | false | 2026-02-05T06:05:11 |
| ✅ **KEEP** | `n8V5Gr98IZif05dv` | WF103 - GitHub Auto-Export v2.0 | true | 2026-02-05T07:43:51 |

**Option A: Delete via n8n UI (Recommended - 2 minutes)**
1. Go to: https://valiansystems.app.n8n.cloud/workflows
2. Find: "WF103 - GitHub Auto-Export" (NOT v2.0)
3. Click the three dots (⋮)
4. Click "Delete"
5. Confirm deletion

**Option B: Delete via API (1 minute)**
```bash
curl -X DELETE "https://valiansystems.app.n8n.cloud/api/v1/workflows/4gpdeqt57NKyJY01" \
  -H "X-N8N-API-KEY: [REDACTED_N8N_JWT]"

# Verify deletion
curl -s "https://valiansystems.app.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: [REDACTED_N8N_JWT]" | \
  jq '.data[] | select(.name | contains("WF103")) | {id: .id, name: .name, active: .active}'
```

**Expected:** Only WF103 v2.0 should remain

---

### ❌ Task 4: Delete Unused GitHub Token

**Status:** READY TO DELETE

**Current GitHub Tokens:**

| Token Name | Expiry | Status | Used By |
|------------|--------|--------|---------|
| ❌ "n8n-revos-export" | May 6, 2026 | Never used | NOTHING - DELETE THIS |
| ✅ "RevOS n8n Auto-Export" | May 5, 2026 | Active | WF103 v2.0 - KEEP THIS |

**Action:**
1. Go to: https://github.com/settings/tokens
2. Find: "n8n-revos-export" (the one expiring **May 6, 2026**)
3. Click "Delete"
4. Confirm deletion

**Why delete?**
- Never been used (says "Never used" in GitHub)
- WF103 v2.0 is using "RevOS n8n Auto-Export" token
- Reduces security surface area (fewer active tokens = better)

---

### 🧹 Task 5: Organize n8n Workflows into Folders

**Status:** OPTIONAL (Nice to have)

**Current Workflows (19 total):**
- ✅ **Active RevOS workflows:** WF103 v2.0, WF106 v2.0
- ⏸️ **Old/inactive workflows:** WF01-WF14 (from previous projects)

**Recommended Folder Structure:**

```
📁 RevOS (Active - Day 1)
  ├── WF103 v2.0: GitHub Auto-Export
  └── WF106 v2.0: Schema Auto-Builder

📁 RevOS (Coming Soon - Days 2-10)
  ├── WF11: Event Logger
  ├── WF109: Identity Resolution
  ├── WF16: Inbound Call Router
  ├── WF17: Voice Orchestrator
  └── WF18: Scheduling

📁 Archive (Old Projects)
  ├── WF01-WF14 (old workflows)
  └── Sub-workflows
```

**How to create folders in n8n:**
1. Go to: https://valiansystems.app.n8n.cloud/workflows
2. Click "Create folder" button
3. Name it "RevOS (Active)"
4. Drag WF103 v2.0 and WF106 v2.0 into folder
5. Repeat for other folders

---

## 📊 Before & After

### Before Cleanup
- ❌ 2 WF103 workflows (duplicate)
- ❌ 2 GitHub tokens (1 unused)
- ❌ No `schema_migrations` table (WF106 failing)
- ❌ 19 workflows in flat list (unorganized)

### After Cleanup
- ✅ 1 WF103 v2.0 workflow (active)
- ✅ 1 GitHub token (in use)
- ✅ `schema_migrations` table exists (WF106 working)
- ✅ Workflows organized in folders

---

## ✅ Verification Checklist

After completing all tasks, verify:

**WF106 Working:**
```bash
# Run test
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/wf106/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"test-003","description":"Verification test","tables":[{"name":"verification_test","columns":[{"name":"status","type":"TEXT"}]}]}}'

# Should return success
```

**WF103 Working:**
```bash
# Check GitHub repo for latest exports
curl -s "https://api.github.com/repos/Valian-Systems/Valian-RevOS/contents/workflows" \
  -H "Authorization: token [REDACTED_GITHUB_PAT]" | \
  jq -r '.[].name' | grep -E "WF103|WF106"

# Should show: WF103_v2_GitHub_Auto_Export.json, WF106_v2_Schema_Builder.json
```

**No Duplicates:**
```bash
# List all WF103 workflows (should only see v2.0)
curl -s "https://valiansystems.app.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: [REDACTED_N8N_JWT]" | \
  jq '.data[] | select(.name | contains("WF103")) | .name'

# Should only return: "WF103 - GitHub Auto-Export v2.0"
```

**GitHub Tokens:**
Check: https://github.com/settings/tokens
- ✅ Should only see: "RevOS n8n Auto-Export" (expiring May 5, 2026)
- ❌ Should NOT see: "n8n-revos-export"

---

## 🎯 Completion Criteria

Infrastructure cleanup is complete when:
- ✅ `schema_migrations` table exists in Supabase
- ✅ WF106 test executes successfully
- ✅ Old WF103 workflow deleted (only v2.0 remains)
- ✅ Unused GitHub token deleted (only 1 active token)
- ✅ All workflows organized in folders (optional)

**Estimated Time:** 10-15 minutes total

---

## 📞 If You Run Into Issues

**WF106 still fails after table creation:**
- Check execution in n8n UI: https://valiansystems.app.n8n.cloud/workflow/TRPGWj3GZTnEvk1R
- Click "Executions" tab
- Find the failed execution
- Click on the red node
- Share the error message

**Can't delete old workflow:**
- Make sure you're deleting the OLD one (ID: 4gpdeqt57NKyJY01)
- NOT the v2.0 (ID: n8V5Gr98IZif05dv)
- If uncertain, use the API delete command (shows exact ID)

**Can't find GitHub token:**
- Go to: https://github.com/settings/tokens
- Look for token expiring "May 6, 2026" (that's the unused one)
- The one expiring "May 5, 2026" is active (keep it)

---

**Last Updated:** 2026-02-05 08:20 UTC
