# WF103 v2.0 Quick Reference Card

## Essential Info

**Workflow ID:** 4gpdeqt57NKyJY01
**Workflow Name:** WF103 - GitHub Auto-Export v2.0
**Version:** 2.0.0
**Trigger:** Cron (every 15 minutes)
**Purpose:** Export n8n workflows to GitHub with orchestration envelope

## Quick Deploy (3 Steps)

### Step 1: Setup Credentials in n8n
```
1. n8n API credential
   - Name: n8n-cloud-api
   - Type: n8n API
   - Get key from: n8n Settings → API

2. GitHub API credential
   - Name: github-valian-revos
   - Type: GitHub API
   - Get token from: GitHub Settings → Developer Settings → PAT
   - Scopes: repo, workflow
```

### Step 2: Import Workflow
```bash
# Option A: Manual (Recommended)
1. Open: https://valiansystems.app.n8n.cloud/workflow/4gpdeqt57NKyJY01
2. Import: /Users/patrick.black/code/Valian/workflows/WF103_v2_definition.json
3. Configure credentials on HTTP nodes
4. Click "Execute Workflow" to test

# Option B: Script
export N8N_API_KEY="your-key"
bash /Users/patrick.black/code/Valian/workflows/deploy_wf103.sh
```

### Step 3: Activate
```
1. Toggle "Active" in n8n UI
2. Verify execution in 15 minutes
3. Check GitHub: github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
```

## Key Features

### Orchestration Envelope
**Input:**
- meta: workflow_name, workflow_run_id, timestamp_utc, tenant_id
- payload: export_mode, wf_range_min, wf_range_max

**Output:**
- meta_out: workflow_name, workflow_run_id, latency_ms, success
- result: status, summary, primary_outputs
- audit: external_calls

### Workflow Pattern
```
WF### workflows only
Filename: WF###_Name_{id}.json
Location: workflows/ directory in GitHub
Commit message: "n8n export: {workflow_name}"
```

## Troubleshooting

### Quick Fixes
| Error | Solution |
|-------|----------|
| "unauthorized" from n8n | Check n8n-cloud-api credential |
| "unauthorized" from GitHub | Check github-valian-revos credential & token scopes |
| "404 Not Found" from GitHub | Verify repo exists, token has access |
| "422 Unprocessable Entity" | SHA mismatch - re-run workflow |
| No workflows exported | Check WF### naming pattern in n8n |

### Check Logs
```
n8n UI → Executions tab → Click execution → View details
Look for: Red error nodes, HTTP error codes, empty workflow arrays
```

## File Locations

**Project Root:** `/Users/patrick.black/code/Valian/`

**Workflow Files:**
- Definition: `workflows/WF103_v2_definition.json`
- Design doc: `workflows/WF103_DESIGN.md`
- Implementation guide: `workflows/WF103_IMPLEMENTATION_GUIDE.md`
- Validation checklist: `workflows/WF103_VALIDATION_CHECKLIST.md`
- Deploy script: `workflows/deploy_wf103.sh`
- This file: `workflows/WF103_QUICK_REFERENCE.md`

**GitHub Output:**
- Repository: `Valian-Systems/Valian-RevOS`
- Branch: `main`
- Directory: `workflows/`
- URL: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows

## URLs

**n8n Cloud:**
- Instance: https://valiansystems.app.n8n.cloud
- Workflow: https://valiansystems.app.n8n.cloud/workflow/4gpdeqt57NKyJY01
- Executions: https://valiansystems.app.n8n.cloud/executions

**GitHub:**
- Repo: https://github.com/Valian-Systems/Valian-RevOS
- Workflows: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
- Settings: https://github.com/settings/tokens

## Node Summary (14 Nodes)

1. Cron_Export_Schedule - Trigger every 15min
2. Set_Envelope_Defaults - Orchestration metadata
3. HTTP_n8n_List_Workflows - Get workflow list
4. Code_Filter_WF_Range - Filter WF### pattern
5. IF_No_Workflows_Found - Handle empty case
6. Set_Noop_Result - Return noop status
7. Split_Workflows - Process individually
8. HTTP_n8n_Get_Workflow_JSON - Get full workflow
9. Code_Normalize_Workflow_JSON - Format & encode
10. HTTP_GitHub_Get_File - Get current SHA
11. HTTP_GitHub_Update_File - Commit to GitHub
12. Set_GitHub_Result - Extract commit info
13. Aggregate_Results - Combine results
14. Set_Output_Envelope - Final output contract

## Expected Behavior

**Every 15 Minutes:**
- Lists all workflows from n8n API
- Filters for WF### pattern (currently WF103, WF106, WF200-206)
- Exports each as pretty JSON
- Commits to GitHub workflows/ directory
- Returns success summary

**Success Indicators:**
- ✓ Execution status: Success (green)
- ✓ result.status: "ok"
- ✓ workflows_exported > 0
- ✓ files_changed > 0
- ✓ GitHub commit history shows recent "n8n export" commits

**Failure Indicators:**
- ✗ Execution status: Error (red)
- ✗ HTTP 401/403: Credential issues
- ✗ HTTP 404: Repository access issues
- ✗ HTTP 422: SHA mismatch

## Monitoring

**Daily:** Check n8n Executions tab for green successes
**Weekly:** Verify GitHub has continuous commit history
**Monthly:** Review workflow export count (should match WF### count in n8n)

**Alerts:** (Future)
- Execution failure > 3 times in 1 hour
- No GitHub commit in 1 hour
- Latency > 120 seconds

## Next Steps After Deployment

1. ✓ Verify first automatic execution (wait 15 min)
2. ✓ Check GitHub for exported workflows
3. Add WF11 event logging (when WF11 exists)
4. Add Slack notifications to #revos-alerts
5. Document in CLAUDE.md
6. Update workflow registry (when WF-registry exists)

---

**Quick Help:**
- Full details: Read WF103_IMPLEMENTATION_GUIDE.md
- Architecture: Read WF103_DESIGN.md
- Validation: Use WF103_VALIDATION_CHECKLIST.md
- Issues: Check n8n execution logs first

**Version:** 2.0.0 | **Updated:** 2026-02-05
