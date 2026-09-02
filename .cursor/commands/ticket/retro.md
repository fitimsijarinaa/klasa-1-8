# Ticket Retrospective Command

Capture actual effort after ticket completion to calibrate future estimates.

## Instructions

When the user invokes `/ticket/retro`, execute the following steps:

### 0. Load Configuration & Identify Ticket

- Read `.cursor/commands/ticket/config.yaml` for settings
- Read `.cursor/commands/ticket/_shared.md` for shared functions
- Apply **Ticket Identification** logic from `_shared.md` to normalize the ticket ID
- If no parameter provided, try to extract from current branch name
- Use `project.jira_base_url` from config

### 2. Load Estimation Data

- Read `tickets/.mr-draft-{TICKET_ID}.md` if it exists
- Extract the original estimation:
  - Expected effort (PD)
  - Subtask breakdown (if available)
- If no estimation found, ask user for the original estimate

### 3. Capture Actual Effort

Ask the user for actual effort:

```markdown
## Retrospective: {TICKET_ID}

### Original Estimation
Expected effort: X.XX PD

### Actual Effort

Please provide the actual effort spent on this ticket:

1. **Total hours spent:** ___
2. **Or total Person Days:** ___

Optional - Breakdown by category:
- Analysis: ___ hours
- Implementation: ___ hours
- Testing: ___ hours
- Review/Fixes: ___ hours
```

### 4. Calculate Variance

Calculate the difference between estimated and actual:

```
Variance = ((Actual - Estimated) / Estimated) * 100%
```

Interpretation:
- **< 10%**: Excellent estimate
- **10-20%**: Good estimate
- **20-50%**: Acceptable, room for improvement
- **> 50%**: Significant deviation, analyze causes

### 5. Analyze Deviation

If variance > 20%, ask follow-up questions:

```markdown
### Deviation Analysis

The actual effort deviated by {X}% from the estimate.

Please answer the following questions:

1. **What was underestimated or overestimated?**
   - [ ] Analysis time
   - [ ] Implementation complexity
   - [ ] Testing effort
   - [ ] Review/bug fixes
   - [ ] Unexpected blockers
   - [ ] Other: ___

2. **Were there unexpected blockers?**
   - [ ] Technical issues
   - [ ] Dependencies on other teams
   - [ ] Unclear requirements
   - [ ] Scope changes
   - [ ] Other: ___

3. **What would you estimate differently next time?**
   ___

4. **Any lessons learned?**
   ___
```

### 6. Save Retrospective

Save to `tickets/.retro-{TICKET_ID}.md`:

```markdown
---
ticket: {TICKET_ID}
estimated_pd: X.XX
actual_pd: Y.YY
variance: +/-Z%
completed: YYYY-MM-DD
---

# Retrospective: {TICKET_ID}

## Summary

| Metric | Value |
|--------|-------|
| Estimated | X.XX PD |
| Actual | Y.YY PD |
| Variance | +/-Z% |
| Rating | [Excellent/Good/Acceptable/Poor] |

## Deviation Analysis

[If applicable]

### Factors
- [Factor 1]
- [Factor 2]

### Lessons Learned
- [Lesson 1]
- [Lesson 2]
```

### 7. Update Estimation History

Append a new row to `tickets/estimation-history.md`:

```markdown
| YYYY-MM-DD | {TICKET_ID} | [Type] | X.XX | Y.YY | +/-Z% | [Brief note] |
```

Also update the metrics section:
- Recalculate average variance
- Update total tickets count
- Recalculate accuracy rate

### 8. Output Summary

```markdown
## Retrospective Completed: {TICKET_ID}

### Effort Comparison

| Metric | Value |
|--------|-------|
| Estimated | X.XX PD |
| Actual | Y.YY PD |
| Variance | +/-Z% |

### Rating: [Excellent/Good/Acceptable/Poor]

[Brief assessment]

### Files Updated
- `tickets/.retro-{TICKET_ID}.md` (retrospective data)
- `tickets/estimation-history.md` (team metrics)

### Cleanup

The following files can now be safely removed:
- `tickets/{TICKET_ID}.md`
- `tickets/.mr-draft-{TICKET_ID}.md`
- `tickets/.dor-{TICKET_ID}.md`
- `tickets/.retro-{TICKET_ID}.md`

Run: `rm -f tickets/{TICKET_ID}.md tickets/.mr-draft-{TICKET_ID}.md tickets/.dor-{TICKET_ID}.md tickets/.retro-{TICKET_ID}.md`
```

## Configuration

See `.cursor/commands/ticket/config.yaml` for all settings.
See `.cursor/commands/ticket/_shared.md` for shared functions.

## Example Usage

```
/ticket/retro REMBEPSW-123
/ticket/retro NFSERVICE-437
/ticket/retro              # Uses current branch
```

## Notes

- Run this command after the MR has been merged
- Actual effort should include all time spent (development, review, fixes)
- Be honest about actual effort - the goal is to improve future estimates
- The estimation history helps identify patterns (e.g., consistently underestimating tests)
- This data is valuable for team retrospectives and process improvement
