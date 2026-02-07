# WF103/WF106 Quick Start Debugging Guide

**Status as of 2026-02-05 07:45 UTC:**
- ⚠️ Both workflows deployed but experiencing execution errors
- 🔧 Immediate debugging required

---

## WF103: GitHub Auto-Export - ERROR

**Issue:** Workflow executes but fails within 45ms
**Impact:** No workflows being exported to GitHub

### Debug Steps (5 minutes)

1. **Open n8n UI:**
   ```
   https://valiansystems.app.n8n.cloud/
   ```

2. **Navigate to WF103:**
   - Workflows → "WF103 - GitHub Auto-Export v2.0"

3. **Check Latest Execution:**
   - Click "Executions" tab
   - Open execution #5002 (2026-02-05 07:15:11 UTC)
   - **Look for:** Error message on failing node

4. **Common Fixes:**
   
   **A. Missing n8n API Credential**
   - Check node: "n8n_List_Workflows" 
   - Credential type: n8n API
   - API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...cSLw`
   
   **B. GitHub Credential Issue**
   - Check node: "GitHub_Get_SHA" or "GitHub_Update_File"
   - Credential: "Header Auth account"
   - Header Name: `Authorization`
   - Header Value: `token [REDACTED_GITHUB_PAT]`

   **C. Data Transformation Error**
   - Check node: "Code_Transform_Workflow_Data"
   - Look for: JavaScript syntax error or undefined variable

5. **Test Fix:**
   - Click "Execute Workflow" button (manual test)
   - Should complete in ~10-30 seconds
   - Check GitHub: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
   - Expected: Workflow JSON files appear

---

## WF106: Schema Auto-Builder - ERROR

**Issue:** Webhook responds with timeout/no response
**Impact:** Cannot deploy database schemas

### Debug Steps (5 minutes)

1. **Open n8n UI:**
   ```
   https://valiansystems.app.n8n.cloud/
   ```

2. **Navigate to WF106:**
   - Workflows → "WF106 - Schema Auto-Builder"

3. **Check Latest Execution:**
   - Click "Executions" tab
   - Open execution #5001 (2026-02-05 07:12:47 UTC)
   - **Look for:** Error message on failing node

4. **Common Fixes:**
   
   **A. Supabase Credential Issue**
   - Check node: "Execute SQL" or "Log Migration"
   - Credential: "Supabase RevOS Production"
   - Host: `db.vjnvddebjrrcgrapuhvn.supabase.co`
   - Port: `6543`
   - Database: `postgres`
   - User: `postgres`
   - Password: `Valian2024!MVP`
   
   **B. Missing schema_migrations Table**
   - Open Supabase SQL Editor: https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn
   - Run:
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
     ```

   **C. SQL Generation Error**
   - Check node: "Generate SQL"
   - Look for: JavaScript error in SQL generation code

5. **Test Fix:**
   - In n8n UI, click "Test workflow" button
   - Click on webhook node → "Listen for test event"
   - In terminal, run:
     ```bash
     curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
       -H "Content-Type: application/json" \
       -d '{"payload":{"schema_version":"001","description":"Test","tables":[{"name":"test_table","columns":[{"name":"name","type":"TEXT"}]}]}}'
     ```
   - Expected: JSON response with `status: "applied"` or `"noop"`

---

## Quick Verification Checklist

After fixes, verify:

### WF103 Working
```bash
# Wait for next cron (every 15 min at :00, :15, :30, :45)
# Then check GitHub:
curl -s "https://api.github.com/repos/Valian-Systems/Valian-RevOS/contents/workflows" \
  -H "Authorization: token [REDACTED_GITHUB_PAT]" | \
  jq -r '.[].name'

# Expected: Multiple .json files (WF103.json, WF106.json, etc.)
```

### WF106 Working
```bash
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/schema-builder" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"schema_version":"999","description":"Quick Test","tables":[{"name":"test","columns":[{"name":"col","type":"TEXT"}]}]}}' | \
  jq '.result.status'

# Expected: "applied" (first time) or "noop" (second time)
```

### Database Verification
```sql
-- In Supabase SQL Editor
SELECT * FROM public.schema_migrations ORDER BY applied_at DESC LIMIT 5;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Expected: schema_migrations table with entries
-- Expected: Tables created by WF106 (tenants, users, patients, etc.)
```

---

## Next Actions After Debugging

Once both workflows are green:

1. **Run Full WF106 Test Suite** (20 min)
   - Execute all 7 test payloads from: `/Users/patrick.black/code/Valian/workflows/WF106_v2_TEST_PAYLOADS.json`
   - Document results

2. **Deploy WF106 v2.0** (5 min)
   - n8n UI → Settings → Import from File
   - Select: `/Users/patrick.black/code/Valian/workflows/WF106_v2_Schema_Builder.json`
   - Replace existing WF106

3. **Deploy Foundation Schema** (5 min)
   - Use WF106 v2.0 to deploy 10-table foundation schema
   - Verify all tables created with RLS policies

4. **Build WF11 Event Logger** (30 min)
   - Next workflow in Day 1 sprint

---

## Contact/Resources

- **Full Test Report:** `/Users/patrick.black/code/Valian/DEPLOYMENT_TEST_REPORT.md`
- **Test Payloads:** `/Users/patrick.black/code/Valian/workflows/WF106_v2_TEST_PAYLOADS.json`
- **n8n Instance:** https://valiansystems.app.n8n.cloud/
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn
- **GitHub Repo:** https://github.com/Valian-Systems/Valian-RevOS

**Estimated Debugging Time:** 10-15 minutes total (5 min per workflow)
**Blocking Issue Resolution:** Required before proceeding to WF11 and beyond

---

**Last Updated:** 2026-02-05 07:45 UTC
