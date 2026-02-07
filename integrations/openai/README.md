# OpenAI Integration

## Overview

RevOS uses OpenAI for Whisper (voice transcription) only.

## Services

| Service | Model | Purpose |
|---------|-------|---------|
| Whisper | whisper-1 | Voice transcription in WF42 |

## Prompts

- `prompts/` — System prompts used in workflows (if applicable)

## Contracts

- `contracts/` — API contract documentation

## Rate Limits

- See OpenAI API docs for current rate limits
- Implement exponential backoff on 429 responses
