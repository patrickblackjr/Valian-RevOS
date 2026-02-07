# Twilio Call Status Callbacks

## Payload

| Field | Type | Description |
|-------|------|-------------|
| `CallSid` | string | Unique call identifier |
| `CallStatus` | string | `completed`, `busy`, `failed`, `no-answer`, `canceled` |
| `CallDuration` | number | Duration in seconds |
| `RecordingUrl` | string | URL to recording (if enabled) |
| `RecordingSid` | string | Recording identifier |
