# Ticket Estimate Command

Estimate the effort for implementing a ticket using Three-Point Estimation (PERT).

## Instructions

When the user invokes `/ticket/estimate`, execute the following steps:

### 0. Load Configuration & Identify Ticket

- Read `.cursor/commands/ticket/config.yaml` for settings
- Read `.cursor/commands/ticket/_shared.md` for shared functions
- Apply **Ticket Identification** logic from `_shared.md` to normalize the ticket ID
- Use `project.jira_base_url`, `project.default_prefix`, `ticket_types` from config

### 2. Read Ticket Content

- Read the ticket file from `tickets/{TICKET_ID}.md`
- If file not found, show error with instructions to create it first

### 2.5 Detect Ticket Type

Analyze ticket content to determine type. Use keywords from config (supports EN + DE).

**Bug indicators:**
- EN: bug, fix, error, broken, not working, regression, issue
- DE: Fehler, Bugfix, defekt, funktioniert nicht, Problem, kaputt
- Characteristics: Short description, specific reproduction steps

**Feature indicators:**
- EN: add, implement, create, new, enable, feature, user story
- DE: hinzufügen, implementieren, erstellen, neu, Funktion, Anforderung
- Characteristics: User story format, multiple acceptance criteria

**Refactoring indicators:**
- EN: refactor, improve, optimize, clean up, technical debt, restructure
- DE: refaktorieren, verbessern, optimieren, aufräumen, technische Schulden
- Characteristics: Focus on code quality, no user-visible changes

**Infrastructure indicators:**
- EN: setup, install, configure, deploy, environment, infrastructure
- DE: einrichten, installieren, konfigurieren, Umgebung, Infrastruktur
- Characteristics: DevOps tasks, no business logic

**Detected type will influence subtask templates in Step 6.**

### 3. Check DoR Status

- Read `tickets/.dor-{TICKET_ID}.md` if it exists
- If status was YELLOW: show warning, ask to proceed
- If status was RED: show strong warning:
  ```
  Warning: This ticket has DoR status RED (X/4 criteria met).
  It is strongly recommended to run /ticket/evaluate first and address open questions.
  
  Do you want to proceed with estimation anyway? (This may result in inaccurate estimates)
  ```
- Include DoR status in final estimation report

### 4. Read Estimation Guide

- Read `docs/process/estimation-guide.md` for methodology reference
- Apply the PERT methodology and subtask categories

### 5. Code Analysis (MANDATORY)

Analyze the codebase to understand the actual complexity. This step is **required** for accurate estimation.

#### 5.1 Extract Keywords from Ticket

Identify technical keywords from the ticket text:
- Class names, function names, variable names
- API endpoints, routes
- Database tables, field names
- File paths mentioned
- Technical terms specific to the domain

#### 5.2 Search the Codebase

Use Grep and SemanticSearch to find relevant code:

```
1. Search for exact matches (class names, function names)
2. Search for related patterns (similar naming conventions)
3. Use semantic search for conceptual matches
```

#### 5.3 Analyze Found Code

For each relevant file found, analyze:

| Aspect | What to check |
|--------|---------------|
| **File Count** | How many files are affected? |
| **Lines of Code** | Complexity indicator |
| **Dependencies** | What does this code depend on? |
| **Dependents** | What depends on this code? |
| **Test Coverage** | Are there existing tests? |
| **Code Quality** | Is refactoring needed first? |
| **Patterns Used** | Repository, Service, Event-based? |

#### 5.4 Handle "No Code Found" Scenario

If no relevant code is found, **ask the user**:

```markdown
## Code Analysis: No relevant code found

I searched for the following keywords but found no matching code:
- [keyword 1]
- [keyword 2]
- [keyword 3]

**Questions:**
1. Is this new functionality that doesn't exist yet?
2. Are there different keywords I should search for?
3. Which files or directories are likely affected?
4. Is this ticket for a different codebase/repository?

Please provide more context so I can give an accurate estimation.
```

**Do not proceed with estimation until code context is clarified.**

#### 5.5 Code Analysis Report

Include a summary in the estimation:

```markdown
### Code Analysis

**Keywords searched:** `keyword1`, `keyword2`, `keyword3`

**Files identified:**
- `src/Service/ExampleService.php` (150 LOC, 2 dependencies)
- `src/Controller/ExampleController.php` (80 LOC)
- `tests/Unit/ExampleServiceTest.php` (exists, 60% coverage)

**Complexity Assessment:**
- [Low/Medium/High] - [Brief justification]

**Existing Test Coverage:**
- [None/Partial/Good] - [Details]

**Refactoring Needed:**
- [Yes/No] - [Details if yes]
```

### 6. Analyze and Break Down

Based on the code analysis and detected ticket type, break the ticket down into subtasks.

**Subtask Templates by Ticket Type:**

| Type | Standard Subtasks |
|------|-------------------|
| **Bug** | Analysis, Root Cause Investigation, Fix Implementation, Regression Test, Verify Fix |
| **Feature** | Analysis & Design, Implementation, Unit Tests, Integration/E2E Tests, Documentation, Review |
| **Refactoring** | Analysis, Refactor Implementation, Verify No Regression, Update Tests |
| **Infrastructure** | Analysis & Planning, Setup/Configuration, Verification, Documentation |

**Adjust estimates based on code analysis findings:**
- More files affected → Higher implementation estimate
- No existing tests → Add time for test creation
- Complex dependencies → Higher analysis estimate
- Refactoring needed → Add refactoring subtask

For each subtask, estimate:
- **O** (Optimistic): Best case, everything goes smoothly
- **M** (Most Likely): Realistic, typical conditions
- **P** (Pessimistic): Worst case, unexpected complications

### 7. Calculate Estimates

For each subtask:
```
Expected (E) = (O + 4M + P) / 6
```

Convert to Person Days (PD):
- 8 hours = 1.00 PD
- Round to nearest 0.25 PD (2 hour intervals)

Rounding rules:
- 0-2h → 0.25 PD
- 2-4h → 0.50 PD
- 4-6h → 0.75 PD
- 6-8h → 1.00 PD
- etc.

### 8. Determine Confidence Level

Based on:
- Familiarity with the technology
- Clarity of requirements
- Complexity and unknowns
- Similar past experience
- **Code analysis findings** (new)

Levels:
- **High (80-90%)**: Familiar domain, clear requirements, code well understood
- **Medium (60-80%)**: Some unknowns, typical complexity
- **Low (40-60%)**: Many unknowns, new technology, complex code found
- **Very Low (<40%)**: Exploration/spike needed, no relevant code found

### 9. Generate Estimation Report

Output a structured report:

```markdown
## Effort Estimation: {TICKET_ID}

### Summary
[Brief description of what will be implemented]

**Ticket Type:** [Bug/Feature/Refactoring/Infrastructure]
**DoR Status:** [GREEN/YELLOW/RED or "Not evaluated"]

### Code Analysis

**Keywords searched:** `keyword1`, `keyword2`, `keyword3`

**Files identified:**
- `path/to/File1.php` (X LOC, Y dependencies)
- `path/to/File2.php` (X LOC)
- `tests/path/to/Test.php` (exists/missing)

**Complexity:** [Low/Medium/High] - [Brief justification]
**Test Coverage:** [None/Partial/Good]
**Refactoring Needed:** [Yes/No]

### Subtasks

| # | Task | O | M | P | E | PD |
|---|------|---|---|---|---|-----|
| 1 | [Task based on ticket type template] | Xh | Xh | Xh | X.Xh | X.XX |
| 2 | [Task] | Xh | Xh | Xh | X.Xh | X.XX |
| 3 | [Task] | Xh | Xh | Xh | X.Xh | X.XX |
| ... | ... | ... | ... | ... | ... | ... |

### Total Estimation

| Scenario | Hours | Person Days |
|----------|-------|-------------|
| Optimistic | Xh | X.XX PD |
| Realistic | Xh | X.XX PD |
| Pessimistic | Xh | X.XX PD |
| **Expected** | **Xh** | **X.XX PD** |

### Confidence Level

**[High/Medium/Low/Very Low] (XX%)**

Confidence factors:
- [+] [Positive factor]
- [+] [Positive factor]
- [-] [Negative factor]
- [-] [Negative factor]

### Risks

1. [Risk 1]
2. [Risk 2]
3. [Risk 3]

### Assumptions

1. [Assumption 1]
2. [Assumption 2]
3. [Assumption 3]
```

### 10. Save to MR Draft

After generating the report:
- Save the estimation to `tickets/.mr-draft-{TICKET_ID}.md`
- This will be used later when creating the Merge Request

Format for MR draft:
```markdown
## Summary

[Brief summary from ticket]

Closes {TICKET_ID}

## Ticket Info

- **Type:** [Bug/Feature/Refactoring/Infrastructure]
- **DoR Status:** [GREEN/YELLOW/RED]
- **Jira:** {JIRA_BASE_URL}{TICKET_ID}

## Estimation

**Expected effort: X.XX PD**

[Include subtask breakdown table]
```

### 11. Next Steps Hint

```
Estimation saved to tickets/.mr-draft-{TICKET_ID}.md

Next steps:
1. Run /ticket/start {TICKET_ID} to create the branch and begin work
2. The estimation will be included in the MR description
```

## Configuration

See `.cursor/commands/ticket/config.yaml` for all settings.
See `.cursor/commands/ticket/_shared.md` for shared functions.

## Example Usage

```
/ticket/estimate 123
/ticket/estimate REMBEPSW-123
/ticket/estimate NFSERVICE-437
```

## Notes

- **Code analysis is mandatory** - Do not estimate without understanding the actual code
- If no relevant code is found, **ask the user** before proceeding
- **Ticket type detection** influences subtask templates - verify type is correct
- Always include time for tests (at least 0.25 PD)
- Always include time for code review (at least 0.25 PD)
- Be realistic, not optimistic
- Document assumptions explicitly
- If confidence is Very Low, suggest a spike/research ticket first
- Factor in technical debt and refactoring needs found during code analysis
- DoR status is included in the report - warn if not GREEN
