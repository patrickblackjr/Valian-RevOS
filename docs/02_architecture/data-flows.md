# Data Flows

See CLAUDE.md Section 6 for workflow execution chains.

## Inbound Call (Happy Path)

```
WF16 (route) → WF109 (identity) → WF10 (consent) → WF17 (AI voice)
  → WF14 (memory) → WF18 (schedule) → WF22 (wrap-up)
  → WF11 (log) → WF13 (memory update) → WF42 (alert)
```
