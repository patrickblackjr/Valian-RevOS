# Environment Variables

## Required for Scripts

No environment variables are required for the repo scaffold scripts. They operate on local files only.

## Required for n8n Workflows (stored in n8n credentials, NOT in repo)

| Variable | Purpose | Where Stored |
|----------|---------|-------------|
| `SUPABASE_URL` | Database connection | n8n credential |
| `SUPABASE_SERVICE_KEY` | Database auth | n8n credential |
| `TWILIO_ACCOUNT_SID` | SMS/Voice | n8n credential |
| `TWILIO_AUTH_TOKEN` | SMS/Voice auth | n8n credential |
| `SLACK_BOT_TOKEN` | Slack integration | n8n credential |
| `ANTHROPIC_API_KEY` | Claude API | n8n credential |

**NEVER commit secrets to this repository.** All secrets live in n8n credentials or 1Password.
