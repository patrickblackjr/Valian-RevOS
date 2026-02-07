# Slack Integration

## Overview

RevOS uses Slack for alerts, build notifications, and bot commands.

## Channels

- **#revos-build** (C0ADXPPPHK2) — Build progress, task updates, daily digests
- **#revos-alerts** (C0AD73LFHE0) — Booking alerts, missed calls, errors

## Bot

- **App**: RevOS
- **Workflow**: WF42 (Slack Bot)
- **Features**: AI chat, SQL queries, GitHub file reads, CLAUDE.md updates, voice transcripts

## Message Formats

- **Build**: Layout C scorecard (header + dividers + emoji sections + duration footer)
- **Alerts**: Detailed fix format (What happened / Impact / How to fix / Details)

## Files

- [alerts.md](alerts.md) — Alert message templates and routing rules
