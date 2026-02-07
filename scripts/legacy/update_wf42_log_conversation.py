#!/usr/bin/env python3
"""
Update WF42 Slack Command Handler - Code_Log_Conversation node jsCode.
Uses urllib.request (no external dependencies).
"""

import json
import ssl
import urllib.request
import sys

# --- Configuration ---
BASE_URL = "https://valiansystems.app.n8n.cloud/api/v1"
WORKFLOW_ID = "DWf7xeKilNodq0iN"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NDk0ODIxNC1lMmMyLTQ0MjUtODZmZC1jMGE3MjliNGQxMGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwMjU4NDA5LCJleHAiOjE3Nzc5NTM2MDB9.jYZ-_iiQkgM0uaa1hRrYBR8c-CRyS7-AmGwEiZ_cSLw"
TARGET_NODE = "Code_Log_Conversation"

NEW_JSCODE = """// WF42 v4.5: Log conversation to slack_messages + session_messages (unified memory)
const parsed = $('Code_Parse_Event').first().json;
const classify = $('Code_Classify_Intent').first().json;
const userMessage = (parsed.text || '').trim();
const channelName = parsed.channel_name || 'unknown';
const action = classify.action || 'ai_chat';
const needsAi = classify._needs_ai;
const hasAudio = classify.has_audio;

function esc(s) {
  if (!s) return '';
  return String(s).replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "''").replace(/\\0/g, '');
}

let botReply = '';
let msgType = 'text';

if (hasAudio) {
  msgType = 'voice';
  try {
    const voiceAi = $('Code_Format_Voice_AI').first().json;
    botReply = voiceAi.reply_text || '';
  } catch(e) {
    botReply = classify.reply_text || '[voice processing]';
  }
} else if (needsAi) {
  try {
    const aiReply = $('Code_Format_AI_Reply').first().json;
    botReply = aiReply.reply_text || '';
  } catch(e) {
    botReply = '[ai reply unavailable]';
  }
} else {
  botReply = classify.reply_text || '';
}

// Truncate for storage
if (botReply.length > 4000) {
  botReply = botReply.substring(0, 3997) + '...';
}

const channelId = classify.channel_id || '';
const userId = classify.user_id || '';
const threadTs = parsed.thread_ts || parsed.event_ts || '';

// Build metadata JSON for session_messages
const metaUser = JSON.stringify({channel_id: channelId, channel_name: channelName, thread_ts: threadTs, user_id: userId, action: action});
const metaBot = JSON.stringify({channel_id: channelId, channel_name: channelName, thread_ts: threadTs, action: action});

// Three INSERTs: slack_messages + session_messages (user) + session_messages (bot)
let sql = "INSERT INTO slack_messages (channel_name, user_message, bot_reply, action, channel_id, user_id) VALUES ('"
  + esc(channelName) + "', '"
  + esc(userMessage) + "', '"
  + esc(botReply) + "', '"
  + esc(action) + "', '"
  + esc(channelId) + "', '"
  + esc(userId) + "'); ";

// Log user message to unified feed
if (userMessage) {
  sql += "INSERT INTO session_messages (platform, role, content, message_type, metadata) VALUES ('slack', 'user', '"
    + esc(userMessage) + "', '" + esc(msgType) + "', '" + esc(metaUser) + "'::jsonb); ";
}

// Log bot reply to unified feed
if (botReply && botReply !== '[voice processing]' && botReply !== '[ai reply unavailable]') {
  sql += "INSERT INTO session_messages (platform, role, content, message_type, metadata) VALUES ('slack', 'assistant', '"
    + esc(botReply) + "', 'text', '" + esc(metaBot) + "'::jsonb); ";
}

return [{json: { _log_sql: sql }}];"""

# --- Helper ---
def api_request(method, path, body=None):
    """Make an authenticated request to n8n API."""
    url = f"{BASE_URL}{path}"
    ctx = ssl.create_default_context()
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code}: {err_body[:500]}")
        return e.code, None


def main():
    # ---- Step 1: GET the workflow ----
    print(f"[1/5] Fetching workflow {WORKFLOW_ID} ...")
    status, wf = api_request("GET", f"/workflows/{WORKFLOW_ID}")
    if status != 200 or wf is None:
        print(f"FAILED to fetch workflow. HTTP {status}")
        sys.exit(1)

    nodes = wf.get("nodes", [])
    print(f"       Found {len(nodes)} nodes.")

    # ---- Step 2: Find the target node ----
    print(f"[2/5] Looking for node '{TARGET_NODE}' ...")
    target_idx = None
    for i, node in enumerate(nodes):
        if node.get("name") == TARGET_NODE:
            target_idx = i
            break

    if target_idx is None:
        print(f"FAILED: Node '{TARGET_NODE}' not found in workflow.")
        print("       Available nodes:")
        for n in nodes:
            print(f"         - {n.get('name')}")
        sys.exit(1)

    old_code = nodes[target_idx].get("parameters", {}).get("jsCode", "")
    print(f"       Found at index {target_idx}. Current jsCode length: {len(old_code)} chars.")

    # ---- Step 3: Replace jsCode ----
    print(f"[3/5] Replacing jsCode ({len(old_code)} -> {len(NEW_JSCODE)} chars) ...")
    nodes[target_idx]["parameters"]["jsCode"] = NEW_JSCODE

    # ---- Step 4: PUT the full workflow back ----
    print(f"[4/5] Updating workflow via PUT ...")
    put_body = {
        "name": wf["name"],
        "nodes": nodes,
        "connections": wf["connections"],
        "settings": wf.get("settings", {}),
        "staticData": wf.get("staticData"),
    }
    status, result = api_request("PUT", f"/workflows/{WORKFLOW_ID}", put_body)
    if status != 200 or result is None:
        print(f"FAILED to update workflow. HTTP {status}")
        sys.exit(1)
    print(f"       PUT succeeded. Workflow updated.")

    # ---- Step 5: Activate ----
    print(f"[5/5] Activating workflow ...")
    status, act_result = api_request("POST", f"/workflows/{WORKFLOW_ID}/activate")
    if status != 200 or act_result is None:
        print(f"WARNING: Activation returned HTTP {status}. May already be active.")
    else:
        print(f"       Workflow activated. active={act_result.get('active')}")

    # ---- Verify ----
    print("\n--- Verification ---")
    status, verify_wf = api_request("GET", f"/workflows/{WORKFLOW_ID}")
    if status != 200 or verify_wf is None:
        print("FAILED to fetch workflow for verification.")
        sys.exit(1)

    for node in verify_wf.get("nodes", []):
        if node.get("name") == TARGET_NODE:
            updated_code = node.get("parameters", {}).get("jsCode", "")
            has_session_messages = "session_messages" in updated_code
            has_unified_memory = "unified memory" in updated_code
            print(f"Node: {TARGET_NODE}")
            print(f"  jsCode length: {len(updated_code)} chars")
            print(f"  Contains 'session_messages': {has_session_messages}")
            print(f"  Contains 'unified memory': {has_unified_memory}")
            if has_session_messages and has_unified_memory:
                print("\nSUCCESS: Code_Log_Conversation node updated and verified.")
            else:
                print("\nFAILED: New code not found in the node after update.")
                sys.exit(1)
            break
    else:
        print(f"FAILED: Node '{TARGET_NODE}' not found in verification fetch.")
        sys.exit(1)


if __name__ == "__main__":
    main()
