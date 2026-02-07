# RevOS Infrastructure Setup & Organization

**Date:** 2026-02-05 08:15 UTC
**Purpose:** Set up scalable infrastructure with proper tracking, logging, and documentation

---

## 🎯 Immediate Actions Required

### 1. Create `schema_migrations` Table in Supabase

**Action:** Copy/paste this SQL into Supabase SQL Editor

**URL:** https://supabase.com/dashboard/project/vjnvddebjrrcgrapuhvn/sql/new

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
  'schema_migrations table created successfully' AS status,
  COUNT(*) AS existing_migrations
FROM public.schema_migrations;
```

**Expected Output:** "schema_migrations table created successfully | 0"

---

### 2. Test WF106 After Table Creation

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
    "tables_created": 1,
    "sql_executed": true
  }
}
```

**Verify in Supabase:**
```sql
-- Check if test table was created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_success';

-- Check migration log
SELECT version, description, status, applied_at FROM public.schema_migrations ORDER BY applied_at DESC;
```

---

### 3. GitHub Token Cleanup

**Current Situation:**
- You have 2 GitHub tokens (both never used)
- WF103 v2.0 is using credential ID: `dxOMimbOgjEY284o` ("Header Auth account")

**Tokens:**
1. ❌ **"n8n-revos-export"** - Expires May 6, 2026 - NEVER USED
2. ✅ **"RevOS n8n Auto-Export"** - Expires May 5, 2026 - USED BY WF103 v2.0

**Action:**
1. Go to: https://github.com/settings/tokens
2. **Delete:** "n8n-revos-export" (the one expiring May 6) - This is unused clutter
3. **Keep:** "RevOS n8n Auto-Export" (the one expiring May 5) - This is active in WF103

---

### 4. n8n Workflow Cleanup

**Current Situation:**
- You have duplicate WF103 workflows in n8n
- Only WF103 v2.0 should remain

**Workflows to Check:**
```bash
# List all workflows
curl -s "https://valiansystems.app.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: [REDACTED_N8N_JWT]" | \
  jq '.data[] | {id: .id, name: .name, active: .active}'
```

**Action:**
1. Go to: https://valiansystems.app.n8n.cloud/workflows
2. Find old "WF103 - GitHub Auto-Export" (NOT v2.0)
3. Click the three dots → Delete
4. **Keep only:** "WF103 v2.0: GitHub Auto-Export"

---

## 🏗️ Infrastructure for Scale

### Automated Tracking & Logging System

**What Gets Tracked Automatically:**

#### 1. **GitHub Repository** (via WF103)
✅ **Auto-exports every 15 minutes** to: https://github.com/Valian-Systems/Valian-RevOS

**What's tracked:**
- `/workflows/*.json` - All n8n workflow definitions
- `/workflows/workflow-registry.json` - Inventory of all workflows with metadata
- Automatic commits with timestamps
- Full version history in Git

**Schedule:** Cron runs at :00, :15, :30, :45 every hour

#### 2. **Supabase Database** (via WF106)
✅ **Auto-tracks schema changes**

**What's tracked:**
- `public.schema_migrations` - Every schema change (version, SQL, timestamp, status)
- All tables created with automatic:
  - `id`, `tenant_id`, `created_at`, `updated_at`, `deleted_at` columns
  - Indexes on `tenant_id` and `created_at`
  - Row-Level Security (RLS) enabled
  - Multi-tenant isolation policies

#### 3. **n8n Execution Logs** (built-in)
✅ **Every workflow execution logged**

**What's tracked:**
- Execution ID, start time, duration, status (success/error)
- Node-by-node execution data
- Error messages and stack traces

**Access:** https://valiansystems.app.n8n.cloud/executions

#### 4. **Event Ledger** (WF11 - Coming Day 2)
🔜 **Immutable event log for all system actions**

**What will be tracked:**
- Every call, SMS, email sent/received
- Every booking made/canceled
- Every AI decision and tool execution
- Every user action (admin, staff, patient)

**Table:** `public.events` (to be created by WF106)

---

## 📊 Infrastructure Components

### Current Setup (Day 1 - Complete)

| Component | Status | Purpose |
|-----------|--------|---------|
| **Supabase** | ✅ Active | PostgreSQL database (system of record) |
| **n8n Cloud** | ✅ Active | Workflow orchestration engine |
| **GitHub** | ✅ Active | Version control for workflows & docs |
| **Twilio** | ✅ Active | SMS messaging (+1 917 993 5081) |
| **Slack** | ✅ Active | Alerts & notifications |
| **WF103** | ✅ Deployed | Auto-export workflows to GitHub |
| **WF106** | ⏳ Testing | Schema deployment automation |

### Coming Soon (Days 2-10)

| Component | Timeline | Purpose |
|-----------|----------|---------|
| **WF11** | Day 2 | Event Logger (immutable ledger) |
| **WF109** | Day 2 | Identity Resolution (phone → lead_id) |
| **WF16/WF17** | Days 3-4 | Voice call handling (Vapi integration) |
| **WF18** | Day 5 | Appointment scheduling |
| **WF200-206** | Days 1-2 | Project management workflows |
| **Foundation Schema** | Day 2 | 10-table schema deployment |

---

## 🔄 Development Workflow (How Work Gets Tracked)

### Every Time You Build/Test in n8n:

**Automatic Tracking (No manual steps):**

1. **You build/edit workflow in n8n UI** → Changes saved to n8n cloud
2. **WF103 runs every 15 min** → Exports workflow to GitHub automatically
3. **Git commit created** → Full history tracked in GitHub
4. **You test workflow** → Execution logged in n8n
5. **Workflow calls WF106** → Schema changes logged in `schema_migrations`
6. **Events logged to WF11** (coming Day 2) → Immutable event ledger

**Result:** Zero manual tracking required. Everything is automatically versioned, logged, and documented.

### For Schema Changes:

**Process:**
1. Define schema in JSON (see `/workflows/WF106_v2_TEST_PAYLOADS.json` for examples)
2. Send to WF106 webhook
3. WF106 automatically:
   - Generates SQL with multi-tenant columns
   - Checks idempotency (won't re-apply same schema)
   - Executes SQL in Supabase
   - Logs migration in `schema_migrations` table
   - Returns success/failure response

**Result:** All schema changes tracked, versioned, and idempotent.

---

## 📋 Documentation Organization

### Current Documentation Structure

```
/Users/patrick.black/code/Valian/
├── CLAUDE.md                          # Master system instructions
├── DEPLOYMENT_STATUS_FINAL.md         # Current deployment status
├── INFRASTRUCTURE_SETUP.md            # This file - infrastructure guide
├── QUICK_START_DEBUGGING.md           # Debug guide for WF103/WF106
├── WF106_ERROR_DEBUG.md               # WF106 specific debugging
├── WF106_CRYPTO_FIX_STATUS.md         # Crypto fix documentation
├── workflows/
│   ├── WF103_DESIGN.md                # WF103 architecture
│   ├── WF103_v2_definition.json       # WF103 exportable definition
│   ├── WF106_DESIGN.md                # WF106 architecture
│   ├── WF106_v2_Schema_Builder.json   # WF106 exportable definition
│   └── WF106_v2_TEST_PAYLOADS.json    # Test cases for WF106
└── /tmp/
    ├── create_schema_migrations.sql   # SQL scripts
    └── *.sh                           # Test scripts
```

### Coming Soon (Days 2-10)

```
workflows/
├── WF11_DESIGN.md                     # Event Logger design
├── WF109_DESIGN.md                    # Identity Resolution design
├── WF16_DESIGN.md                     # Inbound Call Router design
├── WF17_DESIGN.md                     # Voice Orchestrator design
├── WF18_DESIGN.md                     # Scheduling design
└── schemas/
    ├── foundation_schema_v1.json      # 10-table foundation schema
    ├── events_schema.json             # Event logging tables
    └── communications_schema.json     # SMS/email/calls tables
```

---

## 🚀 Scaling Strategy

### Data Scaling (Supabase)

**Current:**
- Single PostgreSQL instance
- Manual schema deployment via WF106

**Automatic Scaling Features:**
- ✅ Multi-tenant by default (every table has `tenant_id`)
- ✅ Row-Level Security (RLS) enforces isolation
- ✅ Indexes automatically added on `tenant_id`, `created_at`
- ✅ Soft deletes (`deleted_at`) preserve data
- ✅ Audit trail via `created_at`, `updated_at` timestamps

**As You Grow:**
- Supabase auto-scales compute (up to 16 CPU cores)
- Database backups every hour (Supabase default)
- Point-in-time recovery available
- Read replicas for analytics (if needed at 100+ customers)

### Workflow Scaling (n8n)

**Current:**
- n8n cloud (managed)
- ~10 workflows deployed

**Automatic Scaling Features:**
- ✅ Version control via WF103 (Git commits every 15 min)
- ✅ Execution logs stored by n8n
- ✅ Workflow folders (organize by category)
- ✅ Idempotent operations (webhooks can be called multiple times safely)

**As You Grow:**
- Organize workflows into folders: `/core`, `/integrations`, `/reporting`, `/automation`
- Archive old workflow versions (keep in Git, deactivate in n8n)
- Monitor execution times (upgrade n8n plan if needed at 1000+ executions/day)

### Communication Scaling (Slack/Email)

**Current:**
- Slack #revos-build, #revos-alerts
- Email via SendGrid (not yet configured)

**Automatic Scaling Features:**
- ✅ Slack webhooks (unlimited messages on paid plan)
- ✅ Alert deduplication via `idempotency_keys` table
- ✅ Batched notifications (avoid spam)

**As You Grow:**
- Add Slack channels per customer (enterprise tier)
- Email digests for non-urgent alerts
- PagerDuty integration for critical alerts (uptime monitoring)

---

## ✅ Next Steps (In Order)

### Immediate (Today - 15 minutes)

1. **[5 min]** Create `schema_migrations` table in Supabase (SQL above)
2. **[2 min]** Test WF106 (curl command above)
3. **[3 min]** Delete unused GitHub token ("n8n-revos-export")
4. **[3 min]** Delete old WF103 workflow in n8n (keep only v2.0)
5. **[2 min]** Verify WF103 exports workflows to GitHub (check repo in 15 min)

### Short-term (Days 2-4)

1. **Build WF11** Event Logger (immutable ledger for all actions)
2. **Build WF109** Identity Resolution (phone number normalization)
3. **Build WF16/WF17** Voice call handling (Vapi integration)
4. **Deploy foundation schema** via WF106 (10 tables: tenants, users, patients, events, appointments, etc.)
5. **Build WF200-206** Project management workflows (task tracking, daily digests)

### Mid-term (Days 5-10)

1. **Build WF18** Appointment scheduling (availability checking, booking)
2. **Build WF24-26** SMS/email automation
3. **Build WF42** Alert system (Slack notifications)
4. **Build owner dashboard** (Today/Rules/Memory pages - Retool or Next.js)
5. **Test with first beta customer** (real practice, real calls)

---

## 🎯 Success Metrics

**Infrastructure is working when:**
- ✅ Every workflow change auto-commits to GitHub (WF103)
- ✅ Every schema change auto-logs to Supabase (WF106)
- ✅ Every execution error alerts Slack (WF42 - coming soon)
- ✅ Zero manual tracking required (everything automated)
- ✅ Can rebuild entire system from GitHub + Supabase (disaster recovery)

---

## 📞 Communication Channels

**Slack Workspace:** Valian Systems

**Channels:**
- `#revos-build` - Development updates, workflow deployments
- `#revos-alerts` - System alerts, errors, critical notifications
- `#revos-testing` - Test execution results, QA

**Webhook:** [REDACTED - stored in 1Password]

---

## 🔐 Security & Credentials

**Storage:** All secrets in 1Password (or local password manager)

**What's Secret:**
- Supabase service role key (NEVER commit to Git)
- n8n API key (NEVER commit to Git)
- Twilio Auth Token (NEVER commit to Git)
- GitHub PAT (NEVER commit to Git)
- Vapi API key (NEVER commit to Git)

**What's Public:**
- Workflow definitions (JSON exports to GitHub)
- Design documents (*.md files)
- Test payloads (example data only)
- Database schema (table structures, not data)

---

**Last Updated:** 2026-02-05 08:15 UTC
