---
name: Workflow Task
about: Create a workflow development task
title: "WF###: "
labels: workflow
---

## Goal

<!-- One sentence: what should this workflow accomplish? -->

## Inputs

<!-- JSON schema or field list -->

## Outputs

<!-- JSON schema or field list -->

## Dependencies

- **DB Tables**:
- **Other WFs**:
- **External**:

## Acceptance Criteria

- [ ] Workflow deployed and active in n8n
- [ ] JSON exported to `workflows/WF###_<slug>/n8n/WF###.json`
- [ ] Node docs filled for all nodes
- [ ] `happy_path.json` test payload + expected output
- [ ] All events logged via WF11
- [ ] Passes `node scripts/repo_validate.js`
