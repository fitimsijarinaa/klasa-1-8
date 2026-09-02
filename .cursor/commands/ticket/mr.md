# Ticket MR Command

Create a GitLab Merge Request for the current ticket with the prepared MR draft.

## Instructions

When the user invokes `/ticket/mr`, execute the following steps:

### 0. Load Configuration

- Read `.cursor/commands/ticket/config.yaml` for settings
- Read `.cursor/commands/ticket/_shared.md` for shared functions
- Use `project.jira_base_url`, `project.ticket_pattern` from config

### 1. Pre-flight Checks

#### Check Current Branch
- Run `git branch --show-current`
- Extract ticket ID from branch name using pattern `^[A-Z]+-\d+` (e.g., `REMBEPSW-123`, `NFSERVICE-437`)
- If on `develop`, `main`, or `master`, abort:
  ```
  Error: Cannot create MR from protected branch.
  Please switch to a feature branch first (e.g., {TICKET_ID}-description).
  ```

#### Check for Uncommitted Changes
- Run `git status`
- If there are uncommitted changes, show warning:
  ```
  Warning: You have uncommitted changes:
  
  [List of changed files]
  
  Consider committing these changes first with /commit
  Or continue to create MR with current commits only.
  ```

#### Check for Unpushed Commits
- Run `git log origin/develop..HEAD --oneline`
- If no commits, abort:
  ```
  Error: No commits to create MR for.
  Make some commits first, then run /ticket/mr again.
  ```

### 2. Extract Ticket Information

- Extract ticket ID from branch name (e.g., `REMBEPSW-XXX`, `NFSERVICE-XXX`)
- Extract short description from branch name
- Generate Jira link: `{JIRA_BASE_URL}{TICKET_ID}`

### 3. Load MR Draft

- Read `tickets/.mr-draft-{TICKET_ID}.md` if it exists
- If not found, create a basic MR description from:
  - Branch name
  - Commit messages
  - Ticket file (if available)

### 4. Prepare MR Title

Format: `{TICKET_ID}: Short description`

Examples:
- `REMBEPSW-123: Add product price calculation`
- `NFSERVICE-437: Fix API parameter handling`

### 5. Push Branch

Execute:
```bash
git push -u origin HEAD
```

If push fails, show error and possible solutions.

### 6. Create Merge Request

#### Option A: Using glab CLI (if available)

Check if `glab` is installed:
```bash
which glab
```

If available, create MR automatically:
```bash
glab mr create \
  --title "{TICKET_ID}: Short description" \
  --description "$(cat tickets/.mr-draft-{TICKET_ID}.md)" \
  --target-branch develop \
  --remove-source-branch
```

#### Option B: Manual Creation

If `glab` is not available, provide instructions:

```markdown
## Create Merge Request Manually

Branch has been pushed. Create the MR in GitLab:

### GitLab URL
https://gitlab.com/[project-path]/-/merge_requests/new?merge_request[source_branch]={TICKET_ID}-description

### MR Title
{TICKET_ID}: Short description

### MR Description
Copy the content below:

---
[Content of .mr-draft-{TICKET_ID}.md]
---

### Settings
- Target branch: `develop`
- Delete source branch when merged: Yes
- Squash commits: Optional
```

### 7. Output Summary

```markdown
## Merge Request Created: {TICKET_ID}

### Branch
`{TICKET_ID}-description` → `develop`

### MR Link
[Link to MR or instructions]

### Jira Link
{JIRA_BASE_URL}{TICKET_ID}

### Checklist Before Review
- [ ] All acceptance criteria addressed
- [ ] Tests passing (`make test`)
- [ ] Quality checks passing (`make quality-all`)
- [ ] MR description complete
- [ ] Screenshots added (if UI changes)
```

### 8. Cleanup Prompt

Ask if the user wants to clean up temporary files:

```
Do you want to clean up temporary ticket files?

Files to remove:
- tickets/{TICKET_ID}.md (raw ticket text)
- tickets/.mr-draft-{TICKET_ID}.md (MR draft)
- tickets/.dor-{TICKET_ID}.md (DoR evaluation result)

Note: tickets/.retro-{TICKET_ID}.md is kept for historical reference.
Run /ticket/retro after the MR is merged to capture actual effort.

These files are no longer needed as the MR description is now in GitLab.

[Yes/No]
```

If yes, delete the files:
```bash
rm -f tickets/{TICKET_ID}.md tickets/.mr-draft-{TICKET_ID}.md tickets/.dor-{TICKET_ID}.md
```

## Configuration

See `.cursor/commands/ticket/config.yaml` for all settings.
See `.cursor/commands/ticket/_shared.md` for shared functions.

## Example Usage

```
/ticket/mr
```

No parameters needed - ticket number is extracted from branch name.

## Error Handling

### Not on Feature Branch
```
Error: You are on branch 'develop'.
Please switch to a feature branch ({TICKET_ID}-description) first.
```

### No Commits
```
Error: No commits found between develop and current branch.
Make at least one commit before creating an MR.
```

### Push Failed
```
Error: Could not push to origin.
Possible causes:
1. No network connection
2. No push access to repository
3. Branch already exists on remote with different history

Try: git push -u origin HEAD --force-with-lease
(Only if you're sure about overwriting remote branch)
```

### glab Not Authenticated
```
Warning: glab CLI is installed but not authenticated.
Run 'glab auth login' to authenticate, or create the MR manually.
```

## Notes

- MR is always targeted at `develop` branch
- The MR description comes from the prepared draft
- glab CLI provides the best experience but is optional
- Always review the MR description before submitting for review
- Clean up ticket files after MR is created to avoid clutter
- Keep `.retro-{TICKET_ID}.md` until `/ticket/retro` is run after MR merge
- Supports any ticket prefix matching pattern `^[A-Z]+-\d+$`
