# WF103 - GitHub Auto-Export Workflow

**Version:** 2.0.0
**Status:** Production Ready
**Last Updated:** 2026-02-05

---

## What is WF103?

WF103 is an automated workflow that exports all n8n workflows to GitHub every 15 minutes. It's a critical infrastructure component that enables:

- **Version Control:** All workflows backed up to Git
- **Disaster Recovery:** GitHub as source of truth
- **Team Collaboration:** Shared workflow repository
- **Change Tracking:** Full commit history
- **Infrastructure as Code:** Workflows as JSON files

### Key Features

✅ **Fully Automated** - Runs every 15 minutes via cron
✅ **GitHub API Integration** - Works in cloud n8n (no git CLI needed)
✅ **Orchestration Envelope** - Standardized input/output contract
✅ **Smart Filtering** - Only exports WF### workflows
✅ **Normalized Output** - Consistent JSON formatting
✅ **Error Handling** - Graceful failure recovery
✅ **Audit Trail** - Tracks external API calls

---

## Quick Start

### 1. Prerequisites
- n8n cloud instance: https://valiansystems.app.n8n.cloud
- GitHub repository: Valian-Systems/Valian-RevOS
- GitHub Personal Access Token with `repo` scope
- n8n API key

### 2. Setup Credentials

**In n8n:**
1. Create "n8n API" credential named `n8n-cloud-api`
2. Create "GitHub API" credential named `github-valian-revos`

### 3. Deploy Workflow

**Option A: Manual Import (Recommended)**
```
1. Open: https://valiansystems.app.n8n.cloud/workflow/4gpdeqt57NKyJY01
2. Import file: WF103_v2_definition.json
3. Configure credentials on HTTP nodes
4. Test with "Execute Workflow"
5. Activate workflow
```

**Option B: Automated Script**
```bash
export N8N_API_KEY="your-key"
bash deploy_wf103.sh
```

### 4. Verify
- Wait 15 minutes
- Check: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
- Should see exported workflow files

---

## Documentation Index

This package includes comprehensive documentation:

### Core Documentation
1. **README_WF103.md** (this file) - Overview and quick start
2. **WF103_DESIGN.md** - Architecture and technical design
3. **WF103_IMPLEMENTATION_GUIDE.md** - Step-by-step deployment
4. **WF103_VALIDATION_CHECKLIST.md** - Testing and validation

### Supporting Documentation
5. **WF103_QUICK_REFERENCE.md** - Quick reference card
6. **WF103_ARCHITECTURE_DIAGRAM.md** - Visual architecture overview
7. **WF103_DEPLOYMENT_SUMMARY.md** - Deployment summary and metrics

### Deployment Assets
8. **WF103_v2_definition.json** - Workflow definition for import
9. **deploy_wf103.sh** - Automated deployment script

---

## How It Works

### High-Level Flow

```
Every 15 minutes:
  1. List all workflows from n8n API
  2. Filter for WF### pattern
  3. For each workflow:
     - Get full JSON from n8n
     - Normalize (remove timestamps, etc.)
     - Base64 encode
     - Get current GitHub SHA
     - Update file in GitHub
  4. Aggregate results
  5. Return summary
```

### Output
- **Location:** `Valian-RevOS/workflows/`
- **Filename:** `WF###_Name_{id}.json`
- **Format:** Pretty-printed JSON
- **Commit Message:** `n8n export: {workflow_name}`

---

## Architecture

### Workflow Nodes (14 Total)

| Node | Type | Purpose |
|------|------|---------|
| Cron_Export_Schedule | Schedule Trigger | Runs every 15 minutes |
| Set_Envelope_Defaults | Set | Orchestration metadata |
| HTTP_n8n_List_Workflows | HTTP Request | List all workflows |
| Code_Filter_WF_Range | Code | Filter WF### pattern |
| IF_No_Workflows_Found | IF | Check for empty result |
| Set_Noop_Result | Set | Return noop status |
| Split_Workflows | Split Out | Process individually |
| HTTP_n8n_Get_Workflow_JSON | HTTP Request | Get workflow details |
| Code_Normalize_Workflow_JSON | Code | Format and encode |
| HTTP_GitHub_Get_File | HTTP Request | Get current SHA |
| HTTP_GitHub_Update_File | HTTP Request | Create/update file |
| Set_GitHub_Result | Set | Extract commit info |
| Aggregate_Results | Aggregate | Combine results |
| Set_Output_Envelope | Code | Build output contract |

### External Dependencies

**n8n Cloud API:**
- List workflows: `GET /api/v1/workflows`
- Get workflow: `GET /api/v1/workflows/{id}`

**GitHub API:**
- Get file: `GET /repos/{owner}/{repo}/contents/{path}`
- Update file: `PUT /repos/{owner}/{repo}/contents/{path}`

---

## Orchestration Envelope

WF103 v2.0 follows the orchestration envelope convention:

### Input Contract
```json
{
  "meta": {
    "workflow_name": "WF103",
    "workflow_run_id": "exec_abc123",
    "timestamp_utc": "2026-02-05T01:30:00Z",
    "tenant_id": "system",
    "environment": "prod"
  },
  "payload": {
    "export_mode": "incremental",
    "wf_range_min": 0,
    "wf_range_max": 999
  }
}
```

### Output Contract
```json
{
  "meta_out": {
    "workflow_name": "WF103",
    "workflow_run_id": "exec_abc123",
    "latency_ms": 2500,
    "success": true
  },
  "result": {
    "status": "ok",
    "summary": "Exported 8 workflows, committed 8 files to GitHub",
    "primary_outputs": {
      "workflows_exported": 8,
      "files_changed": 8,
      "git_commit_url": "https://github.com/..."
    }
  },
  "audit": {
    "external_calls": [
      {"service": "n8n_api", "endpoint": "workflows", "latency_ms": 750},
      {"service": "github_api", "endpoint": "contents", "latency_ms": 1750}
    ]
  }
}
```

---

## Performance

### Expected Metrics
- **Execution Time:** 2-3 seconds for 8 workflows
- **Latency:** <30 seconds for 10 workflows, <60 seconds for 20 workflows
- **Success Rate:** >95% over 1 week
- **API Calls:**
  - n8n API: 1 list + N get (N = workflow count)
  - GitHub API: 2N (get SHA + update) per workflow

### Resource Usage
- **Daily Executions:** 96 (every 15 minutes)
- **Daily n8n API Calls:** ~864
- **Daily GitHub API Calls:** ~1,536
- **GitHub Rate Limit:** 5,000/hour (we use ~64/hour = 1.3%)

---

## Troubleshooting

### Common Issues

**Error: "unauthorized" from n8n API**
- Check n8n-cloud-api credential is configured
- Verify API key in n8n Settings → API

**Error: "unauthorized" from GitHub API**
- Check github-valian-revos credential
- Verify PAT has `repo` scope
- Check token hasn't expired

**Error: "404 Not Found" from GitHub**
- Verify repository exists: Valian-Systems/Valian-RevOS
- Check GitHub token has access to repository

**Error: "422 Unprocessable Entity"**
- SHA mismatch - file was updated externally
- Re-run workflow to get latest SHA

**No workflows exported**
- Check workflow names match WF### pattern
- Verify wf_range_min/max values (default 0-999)

### Checking Logs
1. Open n8n: https://valiansystems.app.n8n.cloud
2. Click "Executions" tab
3. Find WF103 execution
4. Click to view details
5. Look for red error nodes or HTTP error codes

---

## Monitoring

### What to Monitor
- Execution success rate (target: >95%)
- Average latency (target: <30 seconds)
- GitHub commit frequency (every 15 minutes)
- Error types and frequencies

### Success Indicators
✓ Execution status: Success (green)
✓ result.status: "ok"
✓ workflows_exported > 0
✓ files_changed > 0
✓ GitHub shows recent commits

### Failure Indicators
✗ Execution status: Error (red)
✗ HTTP 401/403: Credential issues
✗ HTTP 404: Repository access issues
✗ HTTP 422: SHA mismatch

---

## Deployment Checklist

### Pre-Deployment
- [ ] n8n API credential created
- [ ] GitHub API credential created
- [ ] Repository exists and accessible
- [ ] Backup existing WF103 v1.0

### Deployment
- [ ] Import WF103_v2_definition.json
- [ ] Configure all HTTP node credentials
- [ ] Test manual execution
- [ ] Verify GitHub export
- [ ] Activate workflow

### Post-Deployment
- [ ] Verify automatic execution (wait 15 min)
- [ ] Check GitHub commit history
- [ ] Monitor execution logs
- [ ] Confirm success rate >95%

**Full checklist:** See WF103_VALIDATION_CHECKLIST.md

---

## Future Enhancements

### Phase 2 Features
- WF11 event logging integration
- Slack notifications to #revos-alerts
- Checksum caching (skip unchanged workflows)
- Batch commits (single commit for all changes)
- Parallel GitHub API calls

### Phase 3 Features
- Export credentials (encrypted)
- Export environment variables
- Export workflow execution history
- Versioned exports with Git tags

---

## Files in This Package

| File | Size | Purpose |
|------|------|---------|
| README_WF103.md | ~11 KB | This overview document |
| WF103_v2_definition.json | ~35 KB | Workflow definition for n8n |
| WF103_DESIGN.md | ~8 KB | Architecture and design |
| WF103_IMPLEMENTATION_GUIDE.md | ~15 KB | Deployment instructions |
| WF103_VALIDATION_CHECKLIST.md | ~12 KB | Testing checklist |
| WF103_QUICK_REFERENCE.md | ~10 KB | Quick reference card |
| WF103_ARCHITECTURE_DIAGRAM.md | ~14 KB | Visual architecture |
| WF103_DEPLOYMENT_SUMMARY.md | ~13 KB | Deployment summary |
| deploy_wf103.sh | ~7 KB | Automated deployment script |

**Total:** 9 files, ~125 KB

---

## Support

### Documentation
- **Quick Start:** This file (README_WF103.md)
- **Full Guide:** WF103_IMPLEMENTATION_GUIDE.md
- **Architecture:** WF103_ARCHITECTURE_DIAGRAM.md
- **Validation:** WF103_VALIDATION_CHECKLIST.md

### Resources
- n8n Workflow: https://valiansystems.app.n8n.cloud/workflow/4gpdeqt57NKyJY01
- GitHub Repo: https://github.com/Valian-Systems/Valian-RevOS
- GitHub Workflows: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows

### Getting Help
1. Check execution logs in n8n
2. Review WF103_IMPLEMENTATION_GUIDE.md troubleshooting
3. Verify credentials are configured
4. Test GitHub API access manually
5. Check WF103_VALIDATION_CHECKLIST.md

---

## Success Criteria

**WF103 v2.0 is successful when:**

✓ Executes automatically every 15 minutes
✓ Exports all WF### workflows to GitHub
✓ Maintains >95% success rate
✓ Completes in <60 seconds
✓ Creates valid JSON files in GitHub
✓ No manual intervention required

**This is a critical infrastructure workflow for RevOS.**

---

## Version History

### v2.0.0 (2026-02-05)
- Complete rewrite with GitHub API integration
- Added orchestration envelope compliance
- Improved error handling and normalization
- Cloud-compatible (no git CLI needed)
- Comprehensive documentation package

### v1.0.0 (Previous)
- Initial implementation
- Used git commands for export
- Manual trigger only

---

## License

Internal use only - Valian Systems / RevOS project

---

## Credits

**Built by:** Claude Code (Valian Systems)
**Version:** 2.0.0
**Date:** 2026-02-05
**Status:** Production Ready

---

**Ready to deploy? Start with WF103_IMPLEMENTATION_GUIDE.md**
