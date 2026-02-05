# WF103 v2.0 Validation Checklist

## Pre-Deployment Validation

### 1. Credentials Setup
- [ ] n8n API credential created in n8n cloud
  - Name: `n8n-cloud-api`
  - Type: n8n API
  - Base URL: https://valiansystems.app.n8n.cloud
  - API Key: [Set from n8n Settings → API]

- [ ] GitHub API credential created in n8n cloud
  - Name: `github-valian-revos`
  - Type: GitHub API
  - Access Token: [GitHub Personal Access Token]
  - Scopes: `repo`, `workflow`
  - User: Valian-Systems
  - Repository: Valian-RevOS

- [ ] Test credentials
  - n8n API: Can list workflows
  - GitHub API: Can read/write to repository

### 2. Repository Setup
- [ ] Repository exists: https://github.com/Valian-Systems/Valian-RevOS
- [ ] Branch `main` exists
- [ ] Have write permissions to repository
- [ ] `workflows/` directory exists (or will be created)

### 3. Workflow Files
- [ ] `/Users/patrick.black/code/Valian/workflows/WF103_v2_definition.json` exists
- [ ] `/Users/patrick.black/code/Valian/workflows/WF103_DESIGN.md` exists
- [ ] `/Users/patrick.black/code/Valian/workflows/WF103_IMPLEMENTATION_GUIDE.md` exists
- [ ] `/Users/patrick.black/code/Valian/workflows/deploy_wf103.sh` exists and is executable

## Deployment Validation

### 4. Backup Existing Workflow
- [ ] Opened existing WF103 (ID: 4gpdeqt57NKyJY01) in n8n
- [ ] Created duplicate named "WF103 - GitHub Auto-Export v1.0 BACKUP"
- [ ] Deactivated backup workflow
- [ ] Verified backup workflow saved

### 5. Import New Workflow
**Option A: Manual Import**
- [ ] Imported WF103_v2_definition.json into n8n
- [ ] Workflow name: "WF103 - GitHub Auto-Export v2.0"
- [ ] All 14 nodes visible in canvas
- [ ] No red error indicators on nodes

**Option B: API Import**
- [ ] Set environment variables: N8N_API_KEY, N8N_BASE_URL, WORKFLOW_ID
- [ ] Ran `bash /Users/patrick.black/code/Valian/workflows/deploy_wf103.sh`
- [ ] Script completed without errors
- [ ] Backup created in workflows/ directory

### 6. Credential Configuration
- [ ] Node "HTTP_n8n_List_Workflows" → Credential: `n8n-cloud-api`
- [ ] Node "HTTP_n8n_Get_Workflow_JSON" → Credential: `n8n-cloud-api`
- [ ] Node "HTTP_GitHub_Get_File" → Credential: `github-valian-revos`
- [ ] Node "HTTP_GitHub_Update_File" → Credential: `github-valian-revos`
- [ ] No "missing credential" warnings

### 7. Node Configuration Review
- [ ] **Cron_Export_Schedule**: Schedule = `*/15 * * * *` (every 15 min)
- [ ] **Set_Envelope_Defaults**: All meta fields populated correctly
- [ ] **HTTP_n8n_List_Workflows**: URL = `{{$json.core.n8n_base_url}}/api/v1/workflows`
- [ ] **Code_Filter_WF_Range**: Regex pattern = `^WF(\\d+)`
- [ ] **IF_No_Workflows_Found**: Condition checks `total_workflows === 0`
- [ ] **Split_Workflows**: Field = `core.workflows_to_export`
- [ ] **HTTP_n8n_Get_Workflow_JSON**: URL includes workflow ID variable
- [ ] **Code_Normalize_Workflow_JSON**: Creates filename with WF### prefix
- [ ] **HTTP_GitHub_Get_File**: URL = `https://api.github.com/repos/Valian-Systems/Valian-RevOS/contents/...`
- [ ] **HTTP_GitHub_Update_File**: Method = PUT, includes message, content, sha, branch
- [ ] **Set_Output_Envelope**: Builds meta_out, result, audit objects

## Testing Validation

### 8. Manual Execution Test
- [ ] Clicked "Execute Workflow" in n8n
- [ ] Execution completed (green checkmark)
- [ ] No red error nodes in execution view
- [ ] Execution time < 60 seconds

### 9. Output Validation
- [ ] Final node output includes:
  - `meta_out.workflow_name = "WF103"`
  - `meta_out.success = true`
  - `result.status = "ok"` or `"noop"`
  - `result.primary_outputs.workflows_exported > 0`
  - `result.primary_outputs.files_changed > 0`
  - `audit.external_calls` array has 2 entries (n8n_api, github_api)

### 10. GitHub Verification
- [ ] Visited: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
- [ ] Workflow files present (e.g., `WF103_GitHub_Auto_Export_4gpdeqt57NKyJY01.json`)
- [ ] File contents are valid JSON
- [ ] Commit message format: "n8n export: WF103 - GitHub Auto-Export v2.0"
- [ ] Commit author matches GitHub token user

### 11. Orchestration Envelope Validation
- [ ] Input envelope includes all required `meta` fields
- [ ] Input envelope includes all required `payload` fields
- [ ] Output envelope includes `meta_out` with latency_ms
- [ ] Output envelope includes `result` with status and summary
- [ ] Output envelope includes `audit.external_calls`
- [ ] Envelope follows WF103_DESIGN.md specification

## Activation Validation

### 12. Workflow Activation
- [ ] Toggled "Active" switch in n8n UI
- [ ] Active status shows green indicator
- [ ] Workflow appears in "Active Workflows" list
- [ ] No activation errors in execution log

### 13. Scheduled Execution Monitoring
- [ ] Waited 15 minutes after activation
- [ ] Checked "Executions" tab in n8n
- [ ] Found automatic execution from schedule trigger
- [ ] Execution status = Success (green)
- [ ] Execution shows workflows exported
- [ ] GitHub shows new commits every 15 minutes

### 14. Error Handling Validation
**Test: No Workflows Found**
- [ ] Temporarily changed `wf_range_min` to 900 (no workflows in that range)
- [ ] Executed workflow
- [ ] Result: `result.status = "noop"`
- [ ] No errors thrown
- [ ] Reverted `wf_range_min` to 0

**Test: Invalid Credential**
- [ ] Temporarily removed GitHub credential
- [ ] Executed workflow
- [ ] Result: Execution failed with clear error message
- [ ] Re-added credential
- [ ] Workflow works again

## Performance Validation

### 15. Latency Check
- [ ] Execution latency < 30 seconds for 5 workflows
- [ ] Execution latency < 60 seconds for 10 workflows
- [ ] No timeout errors

### 16. Resource Usage
- [ ] n8n cloud execution quota not exceeded
- [ ] GitHub API rate limit not exceeded (60 requests/hour for authenticated)
- [ ] No memory errors in execution logs

## Integration Validation

### 17. WF11 Integration (Future)
- [ ] WF11 event logger exists (pending)
- [ ] Execute Workflow node added before Set_Output_Envelope
- [ ] Events logged to WF11 successfully
- [ ] No circular dependency issues

### 18. Slack Integration (Future)
- [ ] Slack webhook configured in environment
- [ ] HTTP Request node added to send notifications
- [ ] Notifications received in #revos-alerts channel
- [ ] Only sends on errors or significant exports

## Documentation Validation

### 19. Documentation Complete
- [ ] WF103_DESIGN.md is accurate and up-to-date
- [ ] WF103_IMPLEMENTATION_GUIDE.md covers all deployment steps
- [ ] WF103_VALIDATION_CHECKLIST.md (this file) is comprehensive
- [ ] All file paths are absolute and correct
- [ ] All GitHub URLs are correct

### 20. Code Quality
- [ ] All JavaScript code in Code nodes is properly formatted
- [ ] All expressions use n8n v1 syntax (e.g., `={{ $json.field }}`)
- [ ] No hardcoded credentials in workflow JSON
- [ ] No sensitive data in commit messages
- [ ] Workflow follows orchestration envelope convention

## Rollback Validation

### 21. Rollback Capability
- [ ] Backup workflow (v1.0) still exists in n8n
- [ ] Backup workflow can be activated
- [ ] Backup workflow still functions correctly
- [ ] Clear rollback instructions in implementation guide

## Production Readiness

### 22. Production Checklist
- [ ] All validations above passed
- [ ] Workflow runs successfully in production n8n instance
- [ ] GitHub repository receiving regular exports
- [ ] No manual intervention required
- [ ] Monitoring in place (execution history)
- [ ] Team notified of deployment
- [ ] Documentation linked in CLAUDE.md

### 23. Success Metrics
- [ ] Workflow success rate > 95%
- [ ] GitHub exports happening every 15 minutes
- [ ] All WF### workflows being exported
- [ ] Execution latency stable and acceptable
- [ ] No GitHub merge conflicts or overwrites

## Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Validation Status:**
- [ ] All critical validations passed (items 1-14)
- [ ] All optional validations passed (items 15-23)
- [ ] Workflow approved for production use

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

**Version:** 2.0.0
**Last Updated:** 2026-02-05
**Status:** Active Validation Checklist
