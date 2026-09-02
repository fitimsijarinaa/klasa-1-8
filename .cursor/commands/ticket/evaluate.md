# Ticket Evaluate Command

Evaluate a ticket against the Definition of Ready (DoR) to determine if it's ready for estimation and development.

## Instructions

When the user invokes `/ticket/evaluate`, execute the following steps:

### 0. Load Configuration & Identify Ticket

- Read `.cursor/commands/ticket/config.yaml` for settings
- Read `.cursor/commands/ticket/_shared.md` for shared functions
- Apply **Ticket Identification** logic from `_shared.md` to normalize the ticket ID
- Use `project.jira_base_url`, `project.default_prefix` from config

### 2. Read Ticket Content

- Read the ticket file from `tickets/{TICKET_ID}.md`
- If file not found, show error:
  ```
  Ticket file not found: tickets/{TICKET_ID}.md
  
  Please copy the Jira ticket content to this file first:
  1. Open the ticket in Jira: {JIRA_BASE_URL}{TICKET_ID}
  2. Copy the description and acceptance criteria
  3. Save to tickets/{TICKET_ID}.md
  ```

### 3. Read Definition of Ready

- Read `docs/process/definition-of-ready.md` for the checklist criteria
- If file not found, show warning but continue with basic analysis

### 4. Evaluate Must-Have Criteria

Check the ticket against each Must-Have criterion:

**1. Clear Problem Description or User Story**
- Does the ticket explain the problem or need?
- Is there context and background?
- Is a user story format used (if applicable)?

**2. Acceptance Criteria Defined**
- Are there explicit acceptance criteria?
- Are they specific and testable?
- Are edge cases considered?

**3. Technical Scope Definable**
- Is the scope bounded and clear?
- Are out-of-scope items mentioned?
- Are there ambiguous requirements?

**4. No Open Dependencies**
- Are there blocking dependencies on other tickets?
- Are required services/APIs available?

### 5. Evaluate Should-Have Criteria

Check quality indicators:
- Mockups/wireframes (for UI tickets)
- API specification (for backend tickets)
- Test criteria described
- Risks identified

### 6. Generate DoR Report

Output a structured report:

```markdown
## DoR Evaluation: {TICKET_ID}

### Status: [GREEN/YELLOW/RED]

### Must-Have Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Problem Description | [✓/✗] | [Brief note] |
| Acceptance Criteria | [✓/✗] | [Brief note] |
| Technical Scope | [✓/✗] | [Brief note] |
| No Dependencies | [✓/✗] | [Brief note] |

**Score: X/4 Must-Have criteria met**

### Should-Have Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Mockups/Wireframes | [✓/✗/N/A] | [Brief note] |
| API Specification | [✓/✗/N/A] | [Brief note] |
| Test Criteria | [✓/✗] | [Brief note] |
| Risks Identified | [✓/✗] | [Brief note] |

### Assessment

[Brief overall assessment of the ticket's readiness]

### Questions for Product Owner

[If status is YELLOW or RED, list specific questions that need answers]

1. [Question about missing criterion]
2. [Question about unclear requirement]
```

### 7. Traffic Light Rating

Determine the status:

- **GREEN (Ready)**: All 4 Must-Have criteria met
- **YELLOW (Conditionally Ready)**: 3/4 Must-Have criteria met
- **RED (Not Ready)**: Less than 3/4 Must-Have criteria met

### 8. Save DoR Result

Save the evaluation result to `tickets/.dor-{TICKET_ID}.md`:

```markdown
---
ticket: {TICKET_ID}
status: [GREEN/YELLOW/RED]
score: X/4
evaluated: YYYY-MM-DD HH:MM
---

# DoR Evaluation Result

**Status:** [GREEN/YELLOW/RED]
**Score:** X/4 Must-Have criteria met

## Questions (if any)

1. [Question]
2. [Question]
```

This file will be used by `/ticket/estimate` to:
- Show warning if status was not GREEN
- Include DoR status in estimation report

### 9. Next Steps Hint

Based on the status, suggest next steps:

- **GREEN**: "Ticket is ready. Run `/ticket/estimate {TICKET_ID}` to estimate effort."
- **YELLOW**: "Ticket needs clarification. Address the questions above before proceeding."
- **RED**: "Ticket is not ready. Return to Product Owner with the questions above."

## Configuration

See `.cursor/commands/ticket/config.yaml` for all settings.
See `.cursor/commands/ticket/_shared.md` for shared functions.

## Example Usage

```
/ticket/evaluate 123
/ticket/evaluate REMBEPSW-123
/ticket/evaluate NFSERVICE-437
```

## Notes

- Be constructive in feedback, not just critical
- Suggest improvements where possible
- Consider the ticket type (UI, backend, bugfix) when evaluating
- Missing Should-Have criteria should not block a GREEN rating
- DoR result is saved to `tickets/.dor-{TICKET_ID}.md` for use by other commands
