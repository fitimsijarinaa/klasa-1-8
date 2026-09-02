# Rebase Develop Assistant

Safely rebase current branch against origin/develop with automatic safety checks and backup.

## Instructions for AI Assistant

When user invokes `/rebase-develop` or `/rebase-develop --dry-run`, execute the following steps:

### 1. Pre-Flight Safety Checks

**Step 1: Check Working Tree Status**
- Execute `git status --porcelain` to check for uncommitted changes
- If working tree is not clean, abort and display:
  - List of uncommitted/unstaged files
  - Instructions to commit or stash changes
  - Exit with clear error message

**Step 2: Verify Current Branch**
- Get current branch with `git branch --show-current`
- Prevent rebasing if on protected branches: `develop`, `main`, `master`, or `staging`
- Show current branch name to user
- Display error message if on protected branch

**Step 3: Create Backup Branch**
- Generate timestamp: `date +%Y%m%d-%H%M%S`
- Create backup branch: `backup/{branch-name}-{timestamp}`
- Example: `backup/REMBEPSW-200-fix-list-20251017-114530`
- Confirm backup creation to user

### 2. Fetch and Rebase Workflow

**Step 4: Fetch Latest Develop**
- Execute `git fetch origin develop`
- Show fetch results to user

**Step 5: Dry-Run Mode (if --dry-run flag)**
- Execute `git rebase --dry-run origin/develop`
- Show what would happen without making changes
- Display commit list that would be rebased
- Exit without actual rebase

**Step 6: Execute Rebase (if not dry-run)**
- Get pre-rebase commit hash: `git rev-parse HEAD`
- Execute `git rebase origin/develop`
- Capture rebase status and output
- Get post-rebase commit hash (if successful)

### 3. Conflict Handling

**If Rebase Has Conflicts:**
- Detect conflict state with `git status`
- List all conflicted files
- Provide detailed help:

```markdown
## Rebase Conflict Detected

**Conflicted Files:**
- src/Service/Example.php
- config/services.yaml

**Resolution Options:**

1. **Resolve Conflicts Manually:**
   - Edit conflicted files
   - Mark resolved: `git add <file>`
   - Continue: `git rebase --continue`

2. **Skip This Commit:**
   - `git rebase --skip`

3. **Abort Rebase:**
   - `git rebase --abort`
   - Restore from backup: `git checkout backup/{branch-name}-{timestamp}`

**Conflict Markers:**
<<<<<<< HEAD (your changes)
=======
>>>>>>> origin/develop (incoming changes)
```

### 4. Logging System

**Create Log Directory Structure:**
- Create `reports/rebase/` directory
- Organize by month: `reports/rebase/YYYY-MM/`
- Generate two log files per rebase:
  - `{branch-name}_{timestamp}.json` (structured data)
  - `{branch-name}_{timestamp}.md` (human-readable)

**JSON Log Format:**
```json
{
  "timestamp": "2025-10-17T11:45:30+02:00",
  "branch": "REMBEPSW-200-fix-list",
  "target": "origin/develop",
  "status": "success|conflict|aborted",
  "backup_branch": "backup/REMBEPSW-200-fix-list-20251017-114530",
  "commits_before": "a1b2c3d",
  "commits_after": "e4f5g6h",
  "commits_rebased": 3,
  "files_changed": 15,
  "conflicts": [],
  "duration_seconds": 5.2,
  "rollback_instructions": {
    "orig_head": "git reset --hard ORIG_HEAD",
    "backup_branch": "git checkout backup/REMBEPSW-200-fix-list-20251017-114530",
    "reflog": "git reflog"
  }
}
```

**Markdown Log Format:**
```markdown
## Rebase Operation Log

**Date:** 2025-10-17 11:45:30
**Branch:** REMBEPSW-200-fix-list → origin/develop
**Status:** SUCCESS / CONFLICT / ABORTED
**Duration:** 5.2 seconds

### Pre-Rebase State
- Current commit: a1b2c3d
- Backup branch: backup/REMBEPSW-200-fix-list-20251017-114530
- Files changed: 15
- Commits to rebase: 3

### Post-Rebase State
- New commit: e4f5g6h
- Commits rebased: 3
- Status: Clean / Conflicts

### Rollback Instructions

**Method 1: ORIG_HEAD (fastest)**
git reset --hard ORIG_HEAD

**Method 2: Backup Branch (safest)**
git checkout backup/REMBEPSW-200-fix-list-20251017-114530

**Method 3: Reflog (most flexible)**
git reflog
git reset --hard HEAD@{n}

**Method 4: From Log (precise)**
git reset --hard a1b2c3d
```

### 5. Success Output

**If Rebase Successful:**
```markdown
## Rebase Successful!

**Branch:** REMBEPSW-200-fix-list
**Rebased onto:** origin/develop
**Commits rebased:** 3
**Backup created:** backup/REMBEPSW-200-fix-list-20251017-114530

**Log saved to:**
- reports/rebase/2025-10/REMBEPSW-200-fix-list_20251017-114530.json
- reports/rebase/2025-10/REMBEPSW-200-fix-list_20251017-114530.md

**Next Steps:**
- Review changes: `git log origin/develop..HEAD`
- Run tests: `make phpunit-unit`
- Push (force with lease): `git push --force-with-lease`

**Rollback if needed:**
git reset --hard ORIG_HEAD
```

## Command Options

- `/rebase-develop` - Full rebase with all safety checks
- `/rebase-develop --dry-run` - Show what would happen without rebasing

## Important Notes

- All output in English
- Clear status messages at each step
- Detailed error messages with solutions
- Automatic log file creation
- Backup branch naming convention: `backup/{branch-name}-{timestamp}`
- No emojis in log files
- Consistent timestamp format (YYYYMMDD-HHMMSS)
- Protection for main branches: develop, main, master, staging
- Comprehensive logging (JSON + Markdown)
- Multiple rollback strategies
- Duration tracking and status monitoring
