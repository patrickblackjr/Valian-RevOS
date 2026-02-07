# WF106 Error - Debugging Guide

**Error:** "There was a problem executing the workflow"
**Execution ID:** 5018
**Timestamp:** 2026-02-05 08:05 UTC

---

## What Happened

WF106 received the test request but failed during execution. The error message is generic, which means we need to check the n8n UI to see the specific error.

---

## How to See the Error (2 minutes)

### **Step 1: Open Execution Log**
1. Go to: https://valiansystems.app.n8n.cloud/workflow/TRPGWj3GZTnEvk1R
2. Click the "Executions" tab (top of page)
3. Find execution #5018 (or the most recent with red/error status)
4. Click on it

### **Step 2: Find the Failing Node**
- You'll see the workflow with colored nodes:
  - **Green** = Success
  - **Red** = Failed (this is where the error is)
- Click on the red node to see the error message

---

## Most Likely Issues

### **Issue 1: Node References**
The code nodes might be referencing nodes by name that don't exist.

**Example Error:**
```
Cannot find node: "0.1 Webhook_DB_Auto_Builder_In"
```

**Fix:**
- The node names in v2.0 might not match what the code expects
- Look at the error node's code
- Check if it references `$('Node Name')`
- Make sure the node name matches exactly

### **Issue 2: Missing npm Package**
Code nodes might use packages not available in n8n cloud.

**Example Error:**
```
Cannot find module 'crypto'
```

**Fix:**
- n8n cloud has limited packages
- Use built-in functions instead
- May need to rewrite crypto hash generation

### **Issue 3: Postgres Connection**
Even with credentials, the connection might have issues.

**Example Error:**
```
Connection timeout
```

**Fix:**
- Check if Supabase allows connections from n8n cloud IP
- Verify credentials are correct
- Test connection in n8n credential test

---

## Quick Actions

### **Option A: Check Error in UI** (2 min) - RECOMMENDED
This is the fastest way to see what's wrong:
1. Open executions: https://valiansystems.app.n8n.cloud/executions
2. Click execution #5018
3. See which node is red
4. Read error message
5. **Take a screenshot and share it with me**

### **Option B: Use WF106 v1.0 for Now** (5 min)
If v2.0 is too complex, we can revert to v1.0 temporarily:
1. It was working before (just slower)
2. Simpler = easier to debug
3. Can upgrade to v2.0 later once we fix the issues

### **Option C: Simplify WF106 v2.0** (10 min)
Strip down to basics and add features back one by one:
1. Remove idempotency check
2. Remove input validation
3. Just do: Webhook → Generate SQL → Execute SQL → Respond
4. Once working, add back features

---

## What I Need to Help

**To debug this, I need to see:**
1. The error message from execution #5018
2. Which node failed (the red one)
3. Screenshot of the execution log

**Or you can:**
- Copy/paste the error message here
- Tell me which node name is red

Then I can tell you exactly how to fix it!

---

## Meanwhile: Test WF103

While we debug WF106, let's verify WF103 is working:

### **Check if WF103 Exported Workflows**

```bash
# Check GitHub for exported files
curl -s "https://api.github.com/repos/Valian-Systems/Valian-RevOS/contents/workflows" \
  -H "Authorization: token [REDACTED_GITHUB_PAT]" | \
  jq -r '.[].name'
```

**Expected:** List of .json files

**If empty:** WF103 hasn't run yet (cron is every 15 min)

### **Trigger WF103 Manually**
1. Open: https://valiansystems.app.n8n.cloud/workflow/n8V5Gr98IZif05dv
2. Click "Execute Workflow" button
3. Should complete in ~20 seconds
4. Check GitHub again

---

## Next Steps

1. **Check execution #5018** in n8n UI
2. **Share the error** with me (screenshot or copy/paste)
3. **I'll tell you the fix** immediately
4. **Test WF103** in the meantime

We're 95% done - just need to see that error message! 🎯

---

**Created:** 2026-02-05 08:05 UTC
