# Local Setup

## Prerequisites

- Node.js >= 18
- Git
- Access to the Valian n8n cloud instance
- Supabase CLI (optional, for local DB work)

## Clone and Install

```bash
git clone git@github.com:patrickblackjr/Valian-RevOS.git
cd Valian-RevOS
```

No npm install needed — scripts use only Node.js built-in modules.

## Verify Setup

```bash
# Validate repo structure
node scripts/repo_validate.js

# Scan for secrets
node scripts/secret_scan.js
```

Both should pass on a clean clone.

## Environment Variables

See [02_env-vars.md](02_env-vars.md) for required environment variables.
