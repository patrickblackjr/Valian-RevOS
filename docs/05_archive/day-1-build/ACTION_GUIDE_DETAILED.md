# RevOS: Detailed Action Guide - Exact Steps

**Purpose:** Follow these exact steps to complete infrastructure setup
**Time:** 15 minutes total

---

## 🎯 Action 1: Create `schema_migrations` Table (5 minutes)

### Step 1.1: Open Supabase SQL Editor
1. Open your browser
2. Go to this exact URL: `https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn/sql/new`
3. You should see a page titled "SQL Editor" with a text box

### Step 1.2: Copy the SQL
1. Open Terminal (if not already open)
2. Run this command to display the SQL:
```bash
cat /tmp/create_schema_migrations.sql
```

3. You'll see SQL output starting with `-- RevOS: Schema Migrations Table`
4. **Select ALL the text** from the terminal output (Cmd+A)
5. **Copy it** (Cmd+C)

### Step 1.3: Paste and Run in Supabase
1. Go back to the Supabase SQL Editor browser tab
2. **Click inside the SQL text box** (it should be empty)
3. **Paste the SQL** (Cmd+V)
4. You should see SQL starting with:
```sql
-- RevOS: Schema Migrations Table
-- This table tracks all database schema changes applied by WF106

CREATE TABLE IF NOT EXISTS public.schema_migrations (
```

5. **Click the green "Run" button** (bottom right of the SQL box)

### Step 1.4: Verify Success
After clicking Run, you should see at the bottom:
- ✅ **"Success. No rows returned"** (this is normal)
- OR ✅ **A table showing:** `status: "schema_migrations table created successfully" | existing_migrations: 0`

**If you see an error:**
- Screenshot the error
- Share it with me
- Don't proceed to Action 2

**If you see success:**
- ✅ Proceed to Action 2

---

## 🎯 Action 2: Test WF106 (2 minutes)

### Step 2.1: Run Test Command
1. Go back to Terminal
2. **Copy this ENTIRE command** (click to select, then Cmd+C):

```bash
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/wf106/schema-builder" -H "Content-Type: application/json" -d '{"payload":{"schema_version":"test-002","description":"Test after schema_migrations table","tables":[{"name":"test_success","columns":[{"name":"message","type":"TEXT"}]}]}}'
```

3. **Paste into Terminal** (Cmd+V)
4. **Press Enter**

### Step 2.2: Check Response
You should see JSON output that looks like this:

✅ **GOOD Response (Success):**
```json
{
  "result": {
    "status": "applied",
    "version": "test-002",
    "tables_created": 1
  }
}
```

❌ **BAD Response (Error):**
```json
{
  "code": 0,
  "message": "There was a problem executing the workflow"
}
```

**If you see the GOOD response:**
- ✅ WF106 is working! Proceed to Action 3

**If you see the BAD response:**
1. Go to: `https://valiansystems.app.n8n.cloud/workflow/TRPGWj3GZTnEvk1R`
2. Click the "Executions" tab (top of page)
3. Click the most recent execution (should be red/error)
4. Find the RED node
5. Click on it
6. Screenshot the error message
7. Share with me - DO NOT proceed to Action 3

### Step 2.3: Verify Table Created in Supabase
1. Go back to Supabase SQL Editor: `https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn/sql/new`
2. **Clear the existing SQL** (Cmd+A, then Delete)
3. **Copy and paste this SQL:**

```sql
-- Check if test table was created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_success';
```

4. **Click "Run"**

**Expected Result:**
```
tablename
---------
test_success
```

✅ If you see `test_success`, WF106 successfully created the table!

---

## 🎯 Action 3: Delete Old WF103 Workflow (2 minutes)

### Step 3.1: Run Delete Script
1. Go to Terminal
2. **Copy and paste this command:**

```bash
/tmp/delete_old_wf103.sh
```

3. **Press Enter**

### Step 3.2: Check Output
You should see:
```
Deleting old WF103 workflow (ID: 4gpdeqt57NKyJY01)...
Verifying deletion...
✅ WF103 - GitHub Auto-Export v2.0 (ID: n8V5Gr98IZif05dv)

✅ Cleanup complete! Only WF103 v2.0 should remain.
```

**What this means:**
- The OLD WF103 (ID: 4gpdeqt57NKyJY01) is deleted
- Only v2.0 remains (ID: n8V5Gr98IZif05dv)

**If you see an error:**
- Screenshot it
- Share with me
- Try manual deletion (see Step 3.3 below)

### Step 3.3: Manual Deletion (If Script Failed)
1. Go to: `https://valiansystems.app.n8n.cloud/workflows`
2. Look for TWO workflows with "WF103" in the name:
   - **WF103 - GitHub Auto-Export** ← This is the OLD one (delete this)
   - **WF103 - GitHub Auto-Export v2.0** ← This is the NEW one (keep this)
3. On the OLD one (WITHOUT "v2.0" in name):
   - Click the **three dots (⋮)** on the right side
   - Click **"Delete"**
   - Click **"Delete"** again to confirm
4. Refresh the page (Cmd+R)
5. Only "WF103 - GitHub Auto-Export v2.0" should remain

---

## 🎯 Action 4: Delete Unused GitHub Token (3 minutes)

### Step 4.1: Open GitHub Tokens Page
1. Go to: `https://github.com/settings/tokens`
2. You should see a page titled "Personal access tokens (classic)"

### Step 4.2: Identify Which Token to Delete
You'll see TWO tokens with "revos" or "n8n" in the name:

**Token 1:**
- Name: `n8n-revos-export`
- Expires: `Wed, May 6 2026`
- Status: `Never used`
- **ACTION: DELETE THIS ONE** ❌

**Token 2:**
- Name: `RevOS n8n Auto-Export`
- Expires: `Tue, May 5 2026`
- Status: `Never used` (but it IS being used by WF103)
- **ACTION: KEEP THIS ONE** ✅

### Step 4.3: Delete Token 1
1. Find the token named **"n8n-revos-export"** (expires May 6)
2. On the right side, click the **"Delete"** button (red text)
3. A confirmation dialog appears
4. Click **"I understand, delete this token"**

### Step 4.4: Verify Deletion
After deletion, you should only see:
- ✅ "RevOS n8n Auto-Export" (expires May 5, 2026)

The "n8n-revos-export" token should be GONE.

---

## 🎯 Action 5: Verify WF103 Auto-Export (3 minutes)

### Step 5.1: Check Current Time
WF103 runs every 15 minutes at:
- :00 (e.g., 8:00, 9:00, 10:00)
- :15 (e.g., 8:15, 9:15, 10:15)
- :30 (e.g., 8:30, 9:30, 10:30)
- :45 (e.g., 8:45, 9:45, 10:45)

**Check your clock.** What's the current time?

**If it's currently:**
- **:00-:14** → Next run at :15 (wait 1-14 minutes)
- **:15-:29** → Next run at :30 (wait 1-14 minutes)
- **:30-:44** → Next run at :45 (wait 1-14 minutes)
- **:45-:59** → Next run at :00 (wait 1-14 minutes)

**Wait for the next 15-minute mark**, then proceed to Step 5.2.

### Step 5.2: Check GitHub Repository
1. Go to: `https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows`
2. You should see a list of `.json` files

**Look for these files:**
- `WF103_v2_GitHub_Auto_Export.json` ← Should exist
- `WF106_v2_Schema_Builder.json` ← Should exist
- `workflow-registry.json` ← Should exist

### Step 5.3: Verify Recent Commit
1. Stay on the same GitHub page
2. Look at the file list - each file shows "Latest commit" timestamp on the right
3. **Check the timestamp** for `WF103_v2_GitHub_Auto_Export.json`

**Expected:** Should show a timestamp from TODAY (2026-02-05)

**If timestamp is old (not today):**
- WF103 hasn't run yet
- Wait for next 15-minute mark (see Step 5.1)
- Refresh page and check again

### Step 5.4: Manual Trigger (If You Don't Want to Wait)
Instead of waiting, you can trigger WF103 manually:

1. Go to: `https://valiansystems.app.n8n.cloud/workflow/n8V5Gr98IZif05dv`
2. Click the **"Test workflow"** button (top right)
3. Wait 10-30 seconds for execution to complete
4. Should see green checkmarks on all nodes
5. Go back to GitHub: `https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows`
6. Refresh page (Cmd+R)
7. Check for `WF103_v2_GitHub_Auto_Export.json` and `WF106_v2_Schema_Builder.json`

---

## ✅ Final Verification Checklist

After completing all 5 actions, verify everything works:

### Check 1: Supabase Tables
1. Go to: `https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn/editor`
2. Click "Table Editor" (left sidebar)
3. You should see these tables:
   - ✅ `schema_migrations`
   - ✅ `test_success`

### Check 2: WF106 Working
Run test again:
```bash
curl -X POST "https://valiansystems.app.n8n.cloud/webhook/wf106/schema-builder" -H "Content-Type: application/json" -d '{"payload":{"schema_version":"test-003","description":"Final verification test","tables":[{"name":"verification_test","columns":[{"name":"status","type":"TEXT"}]}]}}'
```

Expected response:
```json
{
  "result": {
    "status": "applied",
    "version": "test-003",
    "tables_created": 1
  }
}
```

### Check 3: WF103 Exports to GitHub
1. Go to: `https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows`
2. Verify files exist:
   - ✅ `WF103_v2_GitHub_Auto_Export.json`
   - ✅ `WF106_v2_Schema_Builder.json`
   - ✅ `workflow-registry.json`

### Check 4: n8n Workflows Clean
1. Go to: `https://valiansystems.app.n8n.cloud/workflows`
2. Search for "WF103"
3. Should only see: **"WF103 - GitHub Auto-Export v2.0"**
4. Should NOT see: "WF103 - GitHub Auto-Export" (old one deleted)

### Check 5: GitHub Token Clean
1. Go to: `https://github.com/settings/tokens`
2. Should only see ONE token:
   - ✅ "RevOS n8n Auto-Export" (expires May 5, 2026)
3. Should NOT see: "n8n-revos-export" (deleted)

---

## 🎉 Success Criteria

You're done when ALL of these are true:
- ✅ `schema_migrations` table exists in Supabase
- ✅ WF106 test returns `"status": "applied"`
- ✅ Old WF103 workflow deleted from n8n
- ✅ Unused GitHub token deleted
- ✅ WF103 auto-exports workflows to GitHub every 15 minutes

**If all checkmarks are green:** Infrastructure setup is complete! 🚀

**If any checkmark is red:**
1. Screenshot the issue
2. Note which step failed
3. Share with me for troubleshooting

---

## 🆘 Troubleshooting

### Problem: Can't find the SQL file
**Solution:**
```bash
# Re-create the SQL file
cat > /tmp/create_schema_migrations.sql << 'EOF'
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
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON public.schema_migrations(version);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON public.schema_migrations(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_status ON public.schema_migrations(status);
COMMENT ON TABLE public.schema_migrations IS 'Tracks all schema migrations applied by WF106 Schema Auto-Builder';
SELECT 'Table created successfully' AS status, COUNT(*) AS existing_migrations FROM public.schema_migrations;
EOF

# Now display it
cat /tmp/create_schema_migrations.sql
```

### Problem: Delete script doesn't exist
**Solution:**
```bash
# Re-create the delete script
cat > /tmp/delete_old_wf103.sh << 'EOF'
#!/bin/bash
curl -X DELETE "https://valiansystems.app.n8n.cloud/api/v1/workflows/4gpdeqt57NKyJY01" -H "X-N8N-API-KEY: [REDACTED_N8N_JWT]"
EOF

chmod +x /tmp/delete_old_wf103.sh

# Now run it
/tmp/delete_old_wf103.sh
```

### Problem: WF106 still returns error
**Solution:**
1. Go to: `https://valiansystems.app.n8n.cloud/workflow/TRPGWj3GZTnEvk1R`
2. Click "Executions" tab
3. Click the most recent failed execution
4. Screenshot the RED node's error message
5. Share with me

### Problem: Can't find which GitHub token to delete
**Both tokens show "Never used" but ONE is active!**

**Solution - Delete by expiry date:**
- DELETE the one expiring **May 6, 2026** ❌
- KEEP the one expiring **May 5, 2026** ✅

---

**Estimated Total Time:** 15 minutes
**Last Updated:** 2026-02-05 08:30 UTC
