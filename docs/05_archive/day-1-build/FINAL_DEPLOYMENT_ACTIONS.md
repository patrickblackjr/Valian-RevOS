# Final Deployment Actions - WF103 & WF106

**Date:** 2026-02-05
**Status:** Both workflows deployed but require manual debugging

---

## 🎯 Summary

**Deployed Successfully:**
- ✅ WF103 v2.0 - GitHub Auto-Export (ID: n8V5Gr98IZif05dv)
- ✅ WF106 v1.0 - Schema Auto-Builder (ID: TRPGWj3GZTnEvk1R)
- ✅ GitHub API credential created
- ✅ Workflows activated

**Issues Found:**
- ⚠️ WF103: Fast failure (45ms) - likely missing n8n API credential
- ⚠️ WF106: Webhook timeout - likely missing schema_migrations table

**Time to Fix:** 10-15 minutes total

---

## 🔧 Action 1: Fix WF103 (5 minutes)

### Problem
WF103 execution #5002 failed in 45ms. No workflows being exported to GitHub.

### Solution Steps

1. **Open n8n:**
   ```
   https://valiansystems.app.n8n.cloud/workflow/n8V5Gr98IZif05dv
   ```

2. **Check node: "n8n_List_Workflows"**
   - Click on the node
   - Scroll down to "Credentials"
   - Should show: "n8n API"
   - **Issue:** Likely showing "No credentials" or using wrong credential

3. **Fix Credential:**
   - If missing: Click "Create New Credential"
   - Name: `n8n Cloud API`
   - Type: n8n API
   - API Key: `[REDACTED_N8N_JWT]`
   - Base URL: `https://valiansystems.app.n8n.cloud`
   - Click "Save"

4. **Apply to Second Node:**
   - Check node: "n8n_Get_Workflow"
   - Use the same n8n API credential

5. **Check GitHub Credentials:**
   - Node: "GitHub_Get_SHA"
   - Credential should be: "Header Auth account" (ID: dxOMimbOgjEY284o)
   - Header Name: `Authorization`
   - Header Value: `token [REDACTED_GITHUB_PAT]`
   - Do the same for: "GitHub_Update_File"

6. **Test:**
   - Click "Execute Workflow" button (top right)
   - Should complete in ~15-30 seconds
   - Check output shows: `result.status = "ok"` and `workflows_exported > 0`

7. **Verify GitHub:**
   ```bash
   # Check if workflows were exported
   curl -s "https://api.github.com/repos/Valian-Systems/Valian-RevOS/contents/workflows" \
     -H "Authorization: token [REDACTED_GITHUB_PAT]" | \
     jq -r '.[].name'

   # Expected: List of .json files (WF103_*.json, WF106_*.json, etc.)
   ```

---

## 🔧 Action 2: Fix WF106 (5 minutes)

### Problem
WF106 execution #5001 timed out. Cannot deploy schemas.

### Solution Steps

1. **Create schema_migrations Table:**
   - Open Supabase SQL Editor:
     ```
     https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn/sql
     ```

   - Run this SQL:
     ```sql
     CREATE TABLE IF NOT EXISTS public.schema_migrations (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       version TEXT NOT NULL UNIQUE,
       description TEXT,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       applied_by TEXT NOT NULL,
       checksum TEXT NOT NULL,
       status TEXT NOT NULL,
       sql_script TEXT NOT NULL,
       metadata JSONB DEFAULT '{}'::jsonb,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     );

     -- Insert bootstrap record
     INSERT INTO public.schema_migrations (
       version,
       description,
       applied_by,
       checksum,
       status,
       sql_script
     ) VALUES (
       '000',
       'Bootstrap - schema_migrations table',
       'manual',
       'bootstrap',
       'success',
       'CREATE TABLE schema_migrations...'
     ) ON CONFLICT (version) DO NOTHING;
     ```

2. **Open WF106:**
   ```
   https://valiansystems.app.n8n.cloud/workflow/TRPGWj3GZTnEvk1R
   ```

3. **Check Supabase Credential:**
   - Node: "Execute SQL"
   - Credential: "Supabase" or "Supabase RevOS Production"
   - Host: `db.vjnvddebjrrcgrapuhvn.supabase.co`
   - Port: `6543`
   - Database: `postgres`
   - User: `postgres`
   - Password: `Valian2024!MVP` (if needed)

4. **Get Webhook URL:**
   - Click on the Webhook node (first node)
   - Copy the webhook URL (should be something like)
     ```
     https://valiansystems.app.n8n.cloud/webhook/schema-builder
     ```

5. **Test WF106:**
   ```bash
   curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
     -H "Content-Type: application/json" \
     -d '{
       "payload": {
         "schema_version": "test-001",
         "description": "Quick Test",
         "tables": [
           {
             "name": "test_table",
             "columns": [
               {"name": "name", "type": "TEXT"}
             ]
           }
         ]
       }
     }'
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "message": "Schema applied successfully",
     ...
   }
   ```

6. **Verify in Supabase:**
   ```sql
   -- Check migration log
   SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;

   -- Check if test table was created
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

---

## ✅ Action 3: Verify Everything Works (5 minutes)

### Test WF103
```bash
# Wait for next cron execution (every 15 min at :00, :15, :30, :45)
# OR manually trigger in n8n UI

# Check GitHub repo
curl -s "https://api.github.com/repos/Valian-Systems/Valian-RevOS/contents/workflows" \
  -H "Authorization: token [REDACTED_GITHUB_PAT]" | \
  jq -r '.[].name'

# Expected: Multiple .json workflow files
```

### Test WF106 - Run All 7 Test Cases
```bash
# Test 1: Minimal input
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"001","description":"Test 1","tables":[{"name":"users","columns":[{"name":"name","type":"TEXT"}]}]}}'

# Test 2: Full envelope
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"meta":{"workflow_name":"WF106","workflow_version":"2.0.0","tenant_id":"t_test"},"payload":{"schema_version":"002","description":"Test 2","tables":[{"name":"products","columns":[{"name":"name","type":"TEXT"}]}]}}'

# Test 3: Idempotency (re-apply Test 1)
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"001","description":"Test 1","tables":[{"name":"users","columns":[{"name":"name","type":"TEXT"}]}]}}'
# Expected: "noop" status (already applied)

# Test 4: Missing schema_version (should fail)
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"description":"Test 4","tables":[{"name":"fail","columns":[{"name":"name","type":"TEXT"}]}]}}'
# Expected: HTTP 400, validation error

# Test 5: Empty tables (should fail)
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"005","description":"Test 5","tables":[]}}'
# Expected: HTTP 400, validation error

# Test 6: Complex 3-table schema
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d @/Users/patrick.black/code/Valian/workflows/WF106_v2_TEST_PAYLOADS.json
# (Use the test_6 payload from the file)

# Test 7: Name normalization
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"007","description":"Test 7","tables":[{"name":"MixedCase","columns":[{"name":"FirstName","type":"TEXT"},{"name":"LastName","type":"TEXT"}]}]}}'
# Expected: Table created as "mixed_case" with columns "first_name" and "last_name"
```

### Verify Database
```sql
-- In Supabase SQL Editor

-- 1. Check all migrations
SELECT version, description, status, applied_at
FROM schema_migrations
ORDER BY applied_at DESC;

-- 2. Check all tables created
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check RLS policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- 4. Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Test multi-tenant fence
-- Should be blocked if no tenant_id set
SELECT * FROM users;
```

---

## 📊 Success Criteria

### WF103 Working
- ✅ Executes without errors in ~15-30 seconds
- ✅ Returns `result.status = "ok"`
- ✅ Shows `workflows_exported > 0`
- ✅ Workflow JSON files appear in GitHub: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
- ✅ Files are properly formatted (name, nodes, connections)
- ✅ Commits show "n8n export: WF###" messages

### WF106 Working
- ✅ All 7 test cases execute successfully
- ✅ Test 1-2, 6-7: Return HTTP 200, `status = "applied"`
- ✅ Test 3: Returns `status = "noop"` (idempotency)
- ✅ Test 4-5: Return HTTP 400, `status = "blocked"` (validation)
- ✅ schema_migrations table has all entries
- ✅ Tables created with correct names (normalized)
- ✅ RLS policies exist on all tables
- ✅ Indexes created correctly
- ✅ Default columns added (id, tenant_id, created_at, updated_at, deleted_at)

---

## 🚀 After Success - Next Steps

Once both workflows are fully working:

1. **Deploy Foundation Schema** (5 min)
   ```bash
   curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
     -H "Content-Type: application/json" \
     -d @/Users/patrick.black/code/Valian/database/001_foundation_schema.json
   ```
   - Should create 10 tables: tenants, users, events, event_metadata, memories, conversation_history, workflow_executions, appointments, phone_calls, call_sessions

2. **Upgrade WF106 to v2.0** (10 min)
   - Import `/Users/patrick.black/code/Valian/workflows/WF106_v2_Schema_Builder.json` via n8n UI
   - Replace existing WF106 v1.0
   - Test with same payloads
   - New features: Orchestration envelope, idempotency hash, auto-normalization, RLS

3. **Build WF11 - Event Logger** (30 min)
   - Next critical infrastructure workflow
   - Accepts universal envelope
   - Logs to events table
   - Returns standard output contract

4. **Organize n8n Folders** (5 min)
   - Create folders: 01-Infrastructure, 02-Brain-Spine, etc.
   - Move WF103 and WF106 into 01-Infrastructure folder

---

## 📁 Key Files

All documentation and resources:
- **This File:** `/Users/patrick.black/code/Valian/FINAL_DEPLOYMENT_ACTIONS.md`
- **Full Test Report:** `/Users/patrick.black/code/Valian/DEPLOYMENT_TEST_REPORT.md`
- **Quick Debugging:** `/Users/patrick.black/code/Valian/QUICK_START_DEBUGGING.md`
- **Test Payloads:** `/Users/patrick.black/code/Valian/workflows/WF106_v2_TEST_PAYLOADS.json`
- **WF103 v2.0 Definition:** `/Users/patrick.black/code/Valian/workflows/WF103_v2_definition.json`
- **WF106 v2.0 Definition:** `/Users/patrick.black/code/Valian/workflows/WF106_v2_Schema_Builder.json`

---

## 🔗 Quick Links

- **n8n:** https://valiansystems.app.n8n.cloud/
- **WF103:** https://valiansystems.app.n8n.cloud/workflow/n8V5Gr98IZif05dv
- **WF106:** https://valiansystems.app.n8n.cloud/workflow/TRPGWj3GZTnEvk1R
- **Supabase:** https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn
- **GitHub Repo:** https://github.com/Valian-Systems/Valian-RevOS

---

## 💡 Pro Tips

1. **n8n Execution Logs:**
   - Always check execution logs first when debugging
   - Look for red nodes = errors
   - Click on failed node to see error message

2. **Credential Debugging:**
   - Test credentials independently first
   - n8n API: Try `curl -H "X-N8N-API-KEY: ..." https://valiansystems.app.n8n.cloud/api/v1/workflows`
   - GitHub API: Try `curl -H "Authorization: token ghp_..." https://api.github.com/repos/Valian-Systems/Valian-RevOS`
   - Supabase: Try `psql -h ... -U postgres postgres -c "SELECT 1"`

3. **Fast Iteration:**
   - Use "Execute Workflow" button for instant testing
   - Don't wait for cron schedules during debugging
   - Check execution logs immediately after each test

4. **SQL Verification:**
   - Always verify in Supabase after schema changes
   - Check: tables exist, columns correct, RLS enabled, indexes created
   - Test queries to ensure multi-tenant fence works

---

**Estimated Total Time:** 15-20 minutes to fully working workflows

**Status After Completion:** ✅ Day 1 Infrastructure Phase Complete

Good luck! 🚀
