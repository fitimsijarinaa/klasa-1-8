# Shared Functions for Ticket Commands

This file contains shared logic used by multiple ticket commands.
Include this at the start of ticket command execution.

## Load Configuration

Read `.cursor/commands/ticket/config.yaml` for all settings:

```yaml
project:
  jira_base_url: "https://netformic.atlassian.net/browse/"
  default_prefix: "REMBEPSW"
  ticket_pattern: "^[A-Z]+-\\d+$"
```

Extract and use these values in subsequent steps.

## Ticket Identification

Standard logic for identifying and normalizing ticket IDs.

### Input Handling

Accept ticket identifier in various formats:
- Full ID: `REMBEPSW-123`, `NFSERVICE-437`
- Number only: `123` (will use default prefix)
- No parameter: Ask user for ticket number

### Normalization Rules

```
1. If input matches ticket_pattern (e.g., ^[A-Z]+-\d+$):
   → Use as-is (e.g., REMBEPSW-123, NFSERVICE-437)

2. If input is numeric only (e.g., 123):
   → Prepend default_prefix from config (e.g., 123 → REMBEPSW-123)

3. If input doesn't match either:
   → Search tickets/ folder for matching file
   → If found, extract ticket ID from filename
   → If not found, ask user for clarification
```

### Example Usage

```
/ticket/start 123           → REMBEPSW-123
/ticket/start REMBEPSW-123  → REMBEPSW-123
/ticket/start NFSERVICE-437 → NFSERVICE-437
/ticket/estimate 456        → REMBEPSW-456
```

### Implementation

```python
def normalize_ticket_id(input: str, config: dict) -> str:
    pattern = config['project']['ticket_pattern']
    default_prefix = config['project']['default_prefix']
    
    # Check if already matches pattern
    if re.match(pattern, input):
        return input
    
    # Check if numeric only
    if input.isdigit():
        return f"{default_prefix}-{input}"
    
    # Search tickets folder
    return search_tickets_folder(input)
```

## Generate Jira Link

```
{jira_base_url}{TICKET_ID}
→ https://netformic.atlassian.net/browse/REMBEPSW-123
```

## Common Pre-flight Checks

### Check for Uncommitted Changes

```bash
git status --porcelain
```

If output is not empty, show warning:
```
Warning: You have uncommitted changes:
[List of changed files]

Consider committing or stashing them before proceeding.
```

### Check Current Branch

```bash
git branch --show-current
```

Extract ticket ID from branch name using pattern `^[A-Z]+-\d+`.

## File Path Templates

Using values from config.yaml:

| Template | Example |
|----------|---------|
| `{paths.tickets_folder}{TICKET_ID}.md` | `tickets/REMBEPSW-123.md` |
| `{paths.mr_draft}` with TICKET_ID | `tickets/.mr-draft-REMBEPSW-123.md` |
| `{paths.dor_result}` with TICKET_ID | `tickets/.dor-REMBEPSW-123.md` |
| `{paths.retro}` with TICKET_ID | `tickets/.retro-REMBEPSW-123.md` |
