# MCP Server Installation Guide

Run these commands in your terminal to install the 3 MCP servers + Supabase skills.

---

## Step 1: Install GitHub MCP Server

```bash
# Make sure Docker is running, then:
claude mcp add github -s user -- docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=[REDACTED_GITHUB_PAT] \
  ghcr.io/github/github-mcp-server
```

---

## Step 2: Install n8n MCP Server

```bash
# Uses npx (Node.js required)
claude mcp add n8n-mcp -s user -e MCP_MODE=stdio \
  -e LOG_LEVEL=error \
  -e DISABLE_CONSOLE_OUTPUT=true \
  -e N8N_API_URL=https://valiansystems.app.n8n.cloud \
  -e N8N_API_KEY=[REDACTED_N8N_JWT] \
  -- npx n8n-mcp
```

---

## Step 3: Install Supabase MCP Server

First, get your Supabase access token:
1. Go to: https://supabase.com/dashboard/account/tokens
2. Create a new token
3. Copy the token (starts with `sbp_`)

Then run:
```bash
# Replace YOUR_TOKEN with your actual Supabase token
claude mcp add supabase -s user -- npx -y @supabase/mcp-server-supabase@latest \
  --access-token YOUR_TOKEN
```

---

## Step 4: Install Supabase Agent Skills

```bash
# Install the PostgreSQL best practices skill
cd ~/.claude/skills
git clone https://github.com/supabase/agent-skills.git supabase-skills
```

Or if you prefer npx:
```bash
npx skills add supabase/agent-skills
```

---

## Step 5: Verify Installation

```bash
# List all MCP servers
claude mcp list

# Test each server (restart Claude Code after adding)
```

---

## After Installation

1. **Restart Claude Code** (close and reopen the terminal/VSCode)
2. Test each MCP server:
   - GitHub: Ask me to "list repos in Valian-Systems"
   - n8n: Ask me to "list all workflows"
   - Supabase: Ask me to "list tables in the database"

---

## Troubleshooting

**Docker not running:** GitHub MCP needs Docker. Run `docker ps` to check.

**Node not installed:** n8n and Supabase MCPs need Node.js. Run `node --version` to check.

**Permission denied:** Try with `sudo` or check your PATH.

**MCP not connecting:** Check logs with `claude mcp logs <name>`
