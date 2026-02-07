# Twilio Integration

## Overview

RevOS uses Twilio for inbound/outbound voice calls and SMS.

- **Phone Number**: +1 917 993 5081
- **Webhook Target**: WF16 (Inbound Call Router)
- **Rate Limits**: See Twilio console for current limits

## Webhooks

- [inbound_call.md](webhooks/inbound_call.md) — Inbound call webhook payload
- [status_callbacks.md](webhooks/status_callbacks.md) — Call status change callbacks

## Templates

- `templates/sms/` — SMS message templates
- `templates/voice/` — TwiML and voice prompt templates

## Compliance

- [a2p-10dlc.md](compliance/a2p-10dlc.md) — A2P 10DLC registration
