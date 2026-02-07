# Slack Alert Templates

## Booking Alert

```
:white_check_mark: Appointment Booked
Patient: {patient_name}
Time: {date}, {time}
Provider: {provider_name}
Summary: {call_summary}
```

## Missed Call Alert

```
:warning: Missed Call
From: {phone_number} ({lead_status})
Time: Just now
Action needed: Follow up recommended
```

## Error Alert

```
:red_circle: Workflow Error
Workflow: {wf_name}
Node: {node_name}
Error: {error_message}
Trace: {trace_id}
```

All alerts include trace IDs. No credential IDs, SQL, or secrets in Slack.
