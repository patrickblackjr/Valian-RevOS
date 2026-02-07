#!/usr/bin/env python3
"""
Update WF42 Slack Command Handler (ID: DWf7xeKilNodq0iN) on n8n Cloud.
Adds Claude Code session awareness:
  1. PG_Read_DB_Context: Add 5th CTE for recent_sessions
  2. Code_Merge_Context: Update to merge session context
  3. PUT full workflow back, POST activate, verify updates
"""

import json
import ssl
import urllib.request
import sys

API_BASE = "https://valiansystems.app.n8n.cloud/api/v1"
WF_ID = "DWf7xeKilNodq0iN"
API_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJzdWIiOiI1NDk0ODIxNC1lMmMyLTQ0MjUtODZmZC1jMGE3MjliNGQxMGMi"
    "LCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwMjU4"
    "NDA5LCJleHAiOjE3Nzc5NTM2MDB9."
    "jYZ-_iiQkgM0uaa1hRrYBR8c-CRyS7-AmGwEiZ_cSLw"
)

# --- New content for the target nodes ---

NEW_PG_QUERY = """WITH task_data AS (
  SELECT id, title, status, priority, category FROM tasks
  WHERE status IN ('pending','in_progress','blocked') AND deleted_at IS NULL
  ORDER BY CASE WHEN priority='critical' THEN 1 WHEN priority='high' THEN 2 ELSE 3 END, created_at LIMIT 50
),
table_stats AS (
  SELECT relname as table_name, n_live_tup as row_count FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY relname
),
sys_docs AS (
  SELECT content FROM system_docs WHERE name = 'claude_md_condensed' LIMIT 1
),
recent_conversations AS (
  SELECT channel_name, user_message, bot_reply, action, created_at
  FROM slack_messages
  ORDER BY created_at DESC LIMIT 15
),
recent_sessions AS (
  SELECT platform, started_at, status, summary, key_decisions, workflows_deployed, context_tags
  FROM sessions
  ORDER BY started_at DESC LIMIT 5
)
SELECT json_build_object(
  'tasks', COALESCE((SELECT json_agg(row_to_json(t)) FROM task_data t), '[]'::json),
  'table_stats', COALESCE((SELECT json_agg(row_to_json(s)) FROM table_stats s), '[]'::json),
  'system_doc', COALESCE((SELECT content FROM sys_docs), ''),
  'recent_conversations', COALESCE((SELECT json_agg(row_to_json(c)) FROM recent_conversations c), '[]'::json),
  'recent_sessions', COALESCE((SELECT json_agg(row_to_json(rs)) FROM recent_sessions rs), '[]'::json)
) as db_context"""

NEW_MERGE_CONTEXT_CODE = """// WF42 v4.5: Merge PG context + GitHub CLAUDE.md + session history
const pgData = $('PG_Read_DB_Context').first().json;
const githubResp = $input.first().json;

// Parse PG database context
let dbCtx = {};
if (pgData && pgData.db_context) {
  dbCtx = typeof pgData.db_context === 'string' ? JSON.parse(pgData.db_context) : pgData.db_context;
}

// Decode CLAUDE.md from GitHub API response (base64 encoded)
let claudeMd = '';
let source = 'none';
try {
  if (githubResp && githubResp.content) {
    const clean = githubResp.content.replace(/\\n/g, '').replace(/\\r/g, '');
    claudeMd = Buffer.from(clean, 'base64').toString('utf8');
    source = 'github_live';
  }
} catch (e) {
  claudeMd = '';
}

// Fallback to system_docs from database if GitHub fetch failed
if (!claudeMd || claudeMd.length < 100) {
  claudeMd = dbCtx.system_doc || '';
  source = claudeMd.length > 100 ? 'system_docs_cache' : 'none';
}

// Build session context summary (what Claude Code has been building)
let sessionContext = '';
const sessions = dbCtx.recent_sessions || [];
if (sessions.length > 0) {
  sessionContext = 'RECENT DEVELOPMENT SESSIONS:\\n';
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const when = s.started_at ? s.started_at.substring(0, 16) : 'unknown';
    sessionContext += '- [' + s.platform + ' ' + when + ' ' + (s.status || '') + '] ' + (s.summary || 'no summary') + '\\n';
    if (s.workflows_deployed && s.workflows_deployed.length > 0) {
      sessionContext += '  Deployed: ' + s.workflows_deployed.join(', ') + '\\n';
    }
  }
}

return [{json: {
  tasks: dbCtx.tasks || [],
  table_stats: dbCtx.table_stats || [],
  system_doc: claudeMd,
  recent_conversations: dbCtx.recent_conversations || [],
  recent_sessions: sessions,
  session_context: sessionContext,
  _claude_md_source: source,
  _claude_md_length: claudeMd.length
}}];"""


def api_request(method, path, data=None):
    """Make an authenticated API request to n8n Cloud."""
    url = f"{API_BASE}{path}"
    ctx = ssl.create_default_context()
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"  HTTP ERROR {e.code}: {body_text[:500]}")
        return e.code, {}


def main():
    print("=" * 70)
    print("WF42 Session Awareness Update Script")
    print("=" * 70)

    # ---- Step 1: GET the full workflow ----
    print("\n[1/5] GET workflow DWf7xeKilNodq0iN ...")
    status, wf = api_request("GET", f"/workflows/{WF_ID}")
    if status != 200:
        print(f"  FAILED to fetch workflow. Status: {status}")
        sys.exit(1)

    nodes = wf.get("nodes", [])
    print(f"  OK - Fetched '{wf.get('name', '?')}' with {len(nodes)} nodes")

    # ---- Step 2: Update the target nodes ----
    print("\n[2/5] Updating target nodes ...")

    updated_nodes = set()

    for node in nodes:
        name = node.get("name", "")

        if name == "PG_Read_DB_Context":
            node["parameters"]["query"] = NEW_PG_QUERY
            updated_nodes.add("PG_Read_DB_Context")
            print("  Updated PG_Read_DB_Context query")

        elif name == "Code_Merge_Context":
            node["parameters"]["jsCode"] = NEW_MERGE_CONTEXT_CODE
            updated_nodes.add("Code_Merge_Context")
            print("  Updated Code_Merge_Context jsCode")

    expected = {"PG_Read_DB_Context", "Code_Merge_Context"}
    missing = expected - updated_nodes
    if missing:
        print(f"\n  ERROR: Could not find nodes: {missing}")
        sys.exit(1)

    print(f"  All {len(updated_nodes)} target nodes updated successfully")

    # ---- Step 3: PUT the full workflow back ----
    print("\n[3/5] PUT full workflow back ...")

    put_payload = {
        "name": "WF42 Slack Command Handler",
        "nodes": nodes,
        "connections": wf.get("connections", {}),
        "settings": wf.get("settings", {}),
        "staticData": wf.get("staticData"),
    }

    status, result = api_request("PUT", f"/workflows/{WF_ID}", put_payload)
    if status != 200:
        print(f"  FAILED to PUT workflow. Status: {status}")
        sys.exit(1)

    returned_nodes = result.get("nodes", [])
    print(f"  OK - PUT returned {len(returned_nodes)} nodes")

    # ---- Step 4: POST activate ----
    print("\n[4/5] POST activate workflow ...")
    status, act_result = api_request("POST", f"/workflows/{WF_ID}/activate")
    if status != 200:
        print(f"  FAILED to activate. Status: {status}")
        sys.exit(1)

    is_active = act_result.get("active", False)
    print(f"  OK - Workflow active: {is_active}")

    # ---- Step 5: Verify updates ----
    print("\n[5/5] Verifying updates ...")
    status, verify = api_request("GET", f"/workflows/{WF_ID}")
    if status != 200:
        print(f"  FAILED to verify. Status: {status}")
        sys.exit(1)

    v_nodes = verify.get("nodes", [])
    print(f"  Node count: {len(v_nodes)} (expected 44)")

    checks_passed = 0
    checks_total = 3

    for node in v_nodes:
        name = node.get("name", "")

        if name == "PG_Read_DB_Context":
            query = node.get("parameters", {}).get("query", "")
            has_recent_sessions = "recent_sessions" in query
            print(f"  PG_Read_DB_Context query contains 'recent_sessions': {has_recent_sessions}")
            if has_recent_sessions:
                checks_passed += 1
            else:
                print("    FAIL - 'recent_sessions' CTE not found in query")

        elif name == "Code_Merge_Context":
            code = node.get("parameters", {}).get("jsCode", "")
            has_session_context = "session_context" in code
            has_v45 = "v4.5" in code
            print(f"  Code_Merge_Context contains 'session_context': {has_session_context}")
            print(f"  Code_Merge_Context contains 'v4.5': {has_v45}")
            if has_session_context:
                checks_passed += 1
            else:
                print("    FAIL - 'session_context' not found in jsCode")

    # Check node count
    if len(v_nodes) == 44:
        checks_passed += 1
        print(f"  Node count verified: 44")
    else:
        print(f"  FAIL - Node count is {len(v_nodes)}, expected 44")

    print(f"\n{'=' * 70}")
    print(f"RESULT: {checks_passed}/{checks_total} checks passed")
    if checks_passed == checks_total:
        print("SUCCESS - WF42 updated with session awareness (v4.5)")
    else:
        print("PARTIAL FAILURE - Some checks did not pass")
    print(f"{'=' * 70}")

    return 0 if checks_passed == checks_total else 1


if __name__ == "__main__":
    sys.exit(main())
