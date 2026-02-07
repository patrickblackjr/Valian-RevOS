# Next Steps - Deploy WF103 & WF106 v2.0

**Quick Reference:** What to do right now to deploy both workflows

---

## ⚡ Quick Start (10 Minutes Total)

### Step 1: Deploy WF103 (5 min)

**Create GitHub Credential in n8n:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `n8n-revos-export`
4. Select scopes: `repo` (all repo permissions)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

**Import WF103:**
1. Open https://valiansystems.app.n8n.cloud/
2. Click "➕ Add workflow" → "Import from file"
3. Select: `/Users/patrick.black/code/Valian/workflows/WF103_v2_definition.json`
4. Configure credentials:
   - **Node: "GitHub API - Get File SHA"**
     - Click "Create New Credential"
     - Name: `github-valian-revos`
     - Access Token: Paste GitHub token from above
     - Save
   - **Node: "n8n API - List Workflows"**
     - Select existing: `n8n-cloud-api`
5. Click "Save" (top right)
6. Click "Execute Workflow" to test
7. Check execution log - should show "success"
8. Toggle "Active" switch (top left)

**Verify:**
- Go to https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
- Should see workflow JSON files appear within 15 minutes

---

### Step 2: Deploy WF106 (5 min)

**Import WF106:**
1. Open https://valiansystems.app.n8n.cloud/
2. Click "➕ Add workflow" → "Import from file"
3. Select: `/Users/patrick.black/code/Valian/workflows/WF106_v2_Schema_Builder.json`
4. Configure credentials:
   - **All Postgres nodes** (there are 3):
     - Select existing: `Supabase`
5. Click "Save" (top right)
6. Toggle "Active" switch (top left)

**Test:**
```bash
# Get webhook URL from n8n workflow
export WEBHOOK_URL="https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2"

# Run automated tests
cd /Users/patrick.black/code/Valian/workflows
bash test_wf106_v2.sh $WEBHOOK_URL
```

**Expected Output:**
```
✅ TEST 1: Minimal input - PASSED
✅ TEST 2: Full envelope - PASSED
✅ TEST 3: Idempotency - PASSED
✅ TEST 4: Validation (missing field) - PASSED
✅ TEST 5: Validation (empty tables) - PASSED
✅ TEST 6: Complex schema - PASSED
✅ TEST 7: Name normalization - PASSED

All 7 tests passed! ✅
```

**Verify in Supabase:**
```sql
-- Check migration log
SELECT
  version,
  description,
  applied_at,
  status
FROM schema_migrations
ORDER BY applied_at DESC
LIMIT 5;
```

---

## 🎯 You're Done!

Both workflows are now:
- ✅ Deployed to n8n
- ✅ Active and running
- ✅ Tested and verified
- ✅ Following Orchestration Convention v1.0

**WF103** will automatically export workflows to GitHub every 15 minutes.
**WF106** is ready to deploy schemas via webhook.

---

## 📚 If You Need Help

### WF103 Issues
- Read: [workflows/WF103_QUICK_REFERENCE.md](workflows/WF103_QUICK_REFERENCE.md)
- Or: [workflows/WF103_IMPLEMENTATION_GUIDE.md](workflows/WF103_IMPLEMENTATION_GUIDE.md)

### WF106 Issues
- Read: [workflows/WF106_v2_README.md](workflows/WF106_v2_README.md)
- Or: [workflows/WF106_v2_IMPLEMENTATION_GUIDE.md](workflows/WF106_v2_IMPLEMENTATION_GUIDE.md)

### Common Issues

**WF103: "Credentials not found"**
- Make sure you created the `github-valian-revos` credential
- GitHub token needs `repo` scope

**WF103: "404 Not Found" from GitHub API**
- Check repository exists: https://github.com/Valian-Systems/Valian-RevOS
- Check you have write access to the repo

**WF106: Test failures**
- Check Supabase credential is configured
- Make sure schema_migrations table exists (should have been created in Day 1)
- Check database connection in Supabase dashboard

**WF106: "already applied" (noop status)**
- This is expected! It means idempotency is working
- Re-running the same schema returns noop (doesn't re-create tables)
- Change schema_version or tables to apply a new migration

---

## 🚀 What's Next

After deploying these two workflows:

1. **Build WF11** - Event Logger (next critical infrastructure)
2. **Organize n8n** - Create folders (Infrastructure, Brain-Spine, etc.)
3. **Build WF16-17** - Voice system (Call Router, Voice Orchestrator)
4. **Build WF18** - Scheduling Workflow
5. **Build WF200-206** - Project Management workflows

See [DAY_1_PROGRESS.md](DAY_1_PROGRESS.md) for full roadmap.

---

**Quick Reference Created:** 2026-02-05
