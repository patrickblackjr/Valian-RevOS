# Workflow Catalog

All registered workflows in the RevOS system.

---

## WF011 — event-logger (Draft)

**Summary**: Immutable event ledger — logs every system action with T3 PII hashing and phi_access support
**Folder**: `workflows/WF011_event-logger/`
**Depends**: supabase, slack, Supabase (events), Supabase (event_metadata), Supabase (idempotency_keys)

---


## WF042 — slack-bot (Draft)

**Summary**: Slack command handler with RBAC, AI chat, SQL sandbox, GitHub reads, and channel-aware personas
**Folder**: `workflows/WF042_slack-bot/`
**Depends**: slack, supabase, anthropic, github, Supabase (slack_messages), Supabase (bot_actions), Supabase (slack_rbac), Supabase (slack_channel_policy), WF011

---


## WF103 — github-auto-export (Draft)

**Summary**: Auto-exports n8n workflows to GitHub every 15 minutes with content change detection and Layout C scorecard alerts
**Folder**: `workflows/WF103_github-auto-export/`
**Depends**: github, n8n-api, slack, WF011

---


## WF106 — schema-auto-builder (Draft)

**Summary**: Receives JSON blueprint, generates SQL, applies to Supabase with conditional RLS auto-generation
**Folder**: `workflows/WF106_schema-auto-builder/`
**Depends**: supabase, Supabase (schema_migrations), WF011

---


## WF201 — 12-hour-dev-sprint-update (Active)

**Summary**: 12-hour dev sprint update with Layout C scorecard, queries tasks table, sends to Slack
**Folder**: `workflows/WF201_12-hour-dev-sprint-update/`
**Depends**: supabase, slack, Supabase (tasks)

---


## WF016 — inbound-call-router (Draft)

**Summary**: Routes inbound Twilio calls into orchestration
**Folder**: `workflows/WF016_inbound-call-router/`
**Depends**: twilio, supabase, Supabase (call_sessions), Supabase (leads), WF011, WF109

---

<!-- WF103_SCAFFOLD: New entries are appended above this line -->
