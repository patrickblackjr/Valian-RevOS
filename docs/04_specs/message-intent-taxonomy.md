# Message Intent Taxonomy

## Inbound Call Intents

| Intent | Example Utterance | Action |
|--------|------------------|--------|
| `book_appointment` | "I'd like to schedule a cleaning" | Route to WF18 |
| `reschedule` | "I need to change my appointment" | Route to WF18 (reschedule mode) |
| `cancel` | "I need to cancel tomorrow's visit" | Route to WF18 (cancel mode) |
| `question_hours` | "What are your office hours?" | Answer from tenant config |
| `question_insurance` | "Do you accept Delta Dental?" | Answer from tenant config |
| `question_pricing` | "How much is a cleaning?" | Answer from tenant config |
| `emergency` | "I'm in severe pain" | Escalate immediately |
| `medical_question` | "Is this lump normal?" | Decline, offer scheduling |
| `speak_to_human` | "Let me talk to someone" | Transfer or take message |
| `other` | Unclassified | Clarify intent or take message |
