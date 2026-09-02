# Ticket Start Command

Start working on a ticket by creating a feature branch and initializing the MR draft.

## Instructions

When the user invokes `/ticket/start`, execute the following steps:

### 0. Load Configuration & Identify Ticket

- Read `.cursor/commands/ticket/config.yaml` for settings
- Read `.cursor/commands/ticket/_shared.md` for shared functions
- Apply **Ticket Identification** logic from `_shared.md` to normalize the ticket ID
- Use `project.jira_base_url`, `project.default_prefix`, `git.base_branch` from config

### 2. Pre-flight Checks

#### Check for Ticket File
- Check if `tickets/{TICKET_ID}.md` exists
- If not found, show warning:
  ```
  Warning: Ticket file tickets/{TICKET_ID}.md not found.
  Consider copying the Jira ticket content first for reference.
  Continuing anyway...
  ```

#### Check for Uncommitted Changes
- Run `git status`
- If there are uncommitted changes, show warning:
  ```
  Warning: You have uncommitted changes in your working directory.
  Consider committing or stashing them before starting a new ticket.
  
  [Show changed files]
  
  Do you want to continue anyway?
  ```

### 3. Fetch Latest develop

Execute:
```bash
git fetch origin develop
```

If fetch fails, show error and abort.

### 4. Extract Branch Description

From the ticket content (if available) or ask the user:
- Extract a short description (3-4 words max)
- Convert to kebab-case
- Example: "Add product price calculation" → "product-price-calculation"

### 5. Create Feature Branch

Execute:
```bash
git checkout -b {TICKET_ID}-[short-description] {BASE_BRANCH}
```

Example:
```bash
git checkout -b REMBEPSW-123-product-price-calculation origin/develop
git checkout -b NFSERVICE-437-fix-api-parameter origin/develop
```

If branch creation fails (e.g., branch already exists), show error:
```
Error: Branch {TICKET_ID}-[description] already exists.

Options:
1. Switch to existing branch: git checkout {TICKET_ID}-[description]
2. Delete and recreate: git branch -D {TICKET_ID}-[description]
3. Choose a different branch name
```

### 6. Initialize MR Draft

Create or update `tickets/.mr-draft-{TICKET_ID}.md`:

```markdown
## Summary

[Summary extracted from ticket, or placeholder]

Closes {TICKET_ID}

## What changed

- 

## Implementation approach

<!-- To be filled after planning -->

## Acceptance Criteria

- [ ] [Criterion from ticket]
- [ ] [Criterion from ticket]

## Test plan

- [ ] Unit tests passing (`make test-unit`)
- [ ] Quality checks passing (`make quality-all`)
- [ ] Manual testing completed

## Screenshots

<!-- For UI changes -->
```

If an estimation was previously created, merge it into the MR draft.

### 7. Output Summary

```markdown
## Ticket Started: {TICKET_ID}

### Branch Created
`{TICKET_ID}-[short-description]`

### MR Draft Initialized
`tickets/.mr-draft-{TICKET_ID}.md`

### Jira Link
{JIRA_BASE_URL}{TICKET_ID}

### Next Steps

1. **Plan the implementation**
   Switch to Plan mode to create a detailed implementation plan.
   The plan will be added to the MR draft.

2. **Implement the solution**
   - Make small, focused commits
   - Use `/commit` for smart commit messages
   - Run `make quality-all` regularly

3. **Create the Merge Request**
   When ready, run `/ticket/mr` to create the MR with the prepared description.
```

### 8. Plan Mode Hint

Show a clear hint about Plan mode:
```
Hint: Switch to Plan mode now to create an implementation plan.
The plan will help structure your work and will be included in the MR description.
```

## Configuration

See `.cursor/commands/ticket/config.yaml` for all settings.
See `.cursor/commands/ticket/_shared.md` for shared functions.

## Example Usage

```
/ticket/start 123
/ticket/start REMBEPSW-123
/ticket/start NFSERVICE-437
```

## Error Handling

### Network Issues
```
Error: Could not fetch from origin. Check your network connection.
```

### Branch Already Exists
```
Error: Branch {TICKET_ID}-description already exists.
Use 'git checkout {TICKET_ID}-description' to switch to it.
```

### Not on Git Repository
```
Error: Not in a Git repository. Cannot create branch.
```

## Notes

- Always fetch latest develop before creating branch
- Keep branch names short but descriptive
- The MR draft is a living document - update it as you work
- Plan mode integration is manual (Cursor limitation)
