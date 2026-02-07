# Twilio Inbound Call Webhook

## Endpoint

WF16 webhook URL (configured in Twilio console)

## Payload (POST form-encoded)

| Field | Type | Description |
|-------|------|-------------|
| `CallSid` | string | Unique call identifier |
| `AccountSid` | string | Twilio account SID |
| `From` | string | Caller phone number (E.164) |
| `To` | string | RevOS phone number |
| `CallStatus` | string | `ringing`, `in-progress`, etc. |
| `Direction` | string | `inbound` |
| `ApiVersion` | string | Twilio API version |

## Expected Response

TwiML response (XML) — e.g., `<Response><Say>...</Say></Response>` or redirect to voice AI.

## Required Env Vars

- `TWILIO_ACCOUNT_SID` (n8n credential)
- `TWILIO_AUTH_TOKEN` (n8n credential)

## Rate Limits

- No explicit rate limit on inbound webhooks
- n8n webhook has its own concurrency limits

## Failure Handling

- If webhook returns non-200, Twilio retries up to 3 times
- If all retries fail, call goes to voicemail (if configured)
