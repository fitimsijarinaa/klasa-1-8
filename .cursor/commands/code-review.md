# Code Review Assistant

Perform comprehensive code review by comparing current branch against origin/develop.

## Instructions for AI Assistant

When user invokes `/code-review`, execute the following steps:

### 0. Load Configuration

- Read `.cursor/commands/ticket/config.yaml` if it exists for project settings
- Read `.cursor/commands/ticket/_shared.md` for shared functions
- Use `project.jira_base_url` and `project.ticket_pattern` from configuration
- Fall back to defaults if config not found:
  - Ticket Pattern: `^[A-Z]+-\d+$` (matches any UPPERCASE-NUMBER format)
  - Default Prefix: `REMBEPSW`

### 0.5 Pre-flight Checks

Before starting the analysis, verify:

1. **Branch Check**
   - Get current branch with `git branch --show-current`
   - If on `develop`, `main`, or `master`, show warning:
     ```
     Warning: You are on a protected branch ({branch}).
     Code review is most useful on feature branches.
     Continue anyway? [y/N]
     ```

2. **Uncommitted Changes**
   - Run `git status --porcelain`
   - If uncommitted changes exist, show warning:
     ```
     Warning: You have uncommitted changes:
     [List of changed files]
     
     These changes will NOT be included in the review.
     Consider committing them first with /commit
     ```

3. **Commits Exist**
   - Run `git log origin/develop..HEAD --oneline`
   - If no commits, abort:
     ```
     No commits found between origin/develop and current branch.
     Nothing to review.
     ```

### 1. Branch & Diff Analysis
- Get current branch with `git branch --show-current`
- Fetch latest remote changes with `git fetch origin develop`
- Generate diff with `git diff origin/develop...HEAD`
- List all changed files with `git diff --name-status origin/develop...HEAD`
- Show summary statistics (files changed, insertions, deletions)

### 2. Execute Quality Tools
- Read `githook-config.json` to get configured tools
- Execute each tool from `pre-commit` array as `make <command>`
- Execute each tool from `pre-push` array as `make <command>`
- Capture and report results (pass/fail status for each tool)

### 3. Code Analysis
Analyze all changed files and categorize findings:

**A) Code Quality & Best Practices**
- Naming conventions (classes, methods, variables)
- Code duplication
- Method/class complexity
- Single Responsibility Principle violations
- DRY principle violations

**B) SOLID Principles**
- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

**C) Security Issues**
- SQL injection risks
- XSS vulnerabilities
- Insecure data handling
- Missing input validation
- Hardcoded credentials or secrets
- Insecure dependencies

**D) Potential Bugs**
- Null pointer risks
- Type mismatches
- Logic errors
- Edge case handling
- Error handling completeness

**E) Performance Concerns**
- N+1 query problems
- Inefficient loops
- Missing indexes hints
- Memory leaks potential

### 4. Generate Report
Create comprehensive markdown report with:

**Report Structure:**
```markdown
---
ticket: REMBEPSW-XXX
branch: REMBEPSW-XXX-feature-description
jira: https://netformic.atlassian.net/browse/REMBEPSW-XXX
status: YELLOW
date: 2026-02-03T14:30:00
files_changed: 5
insertions: 150
deletions: 45
quality_tools_passed: true
acceptance_criteria_met: 2/3
dor_status: N/A
---

## Code Review Summary

**Branch:** <current-branch> vs origin/develop
**Ticket:** [REMBEPSW-XXX](https://netformic.atlassian.net/browse/REMBEPSW-XXX)
**Date:** YYYY-MM-DD
**Files Changed:** X files (+Y lines, -Z lines)

### Quality Tools Results
[PASS] php-lint - passed
[PASS] phpcs - passed
[FAIL] phpstan - 3 errors found
[PASS] phpunit-unit - passed

### Analysis by File

#### src/Service/Example.php (+50 lines, -10 lines)

**Strengths:**
- Good dependency injection
- Clear method names

**Suggestions:**
- Method `calculateTotal()` is too complex (15+ lines)
  - Consider extracting `validateInput()` helper method
- Missing type hints for `$options` parameter

**Issues:**
- Potential SQL injection on line 45
  - Use parameterized queries instead
- Missing null check for `$user->getEmail()` on line 67

**Code Example:**
```php
// Current (line 45)
$query = "SELECT * FROM users WHERE id = " . $id;

// Suggested
$query = "SELECT * FROM users WHERE id = :id";
$stmt->execute(['id' => $id]);
```

### Overall Assessment

**Review Status: [GREEN/YELLOW/RED]**

Status criteria:
- **GREEN:** All quality tools passed + no critical issues → Ready for review/merge
- **YELLOW:** All quality tools passed + suggestions only → Reviewer decision
- **RED:** Quality tools failed OR critical security/bug issues → Merge blocked

**Summary:**
- 5 files reviewed
- 12 suggestions for improvement
- 3 critical issues requiring immediate attention
- 8 best practice recommendations

**Priority Actions:**
1. Fix SQL injection vulnerability in UserService.php
2. Add null checks in PaymentProcessor.php
3. Reduce complexity in OrderCalculator.php

**SOLID Compliance:** 7/10
**Security Score:** 6/10
**Code Quality:** 8/10
```

### 5. Save Report to File
- Create directory `reports/code-review/` if it doesn't exist
- Generate filename: `{TICKET_ID}_{YYYY-MM-DD_HH-MM}.md` (e.g., `REMBEPSW-204_2025-10-17_14-30.md`)
- Include timestamp to support multiple reviews per day
- Save complete review as Markdown file (no emojis in saved report)
- Display summary to user and confirm file location

**YAML Frontmatter:**
Include machine-readable metadata at the beginning of the report:

```yaml
---
ticket: REMBEPSW-XXX
branch: REMBEPSW-XXX-feature-description
jira: https://netformic.atlassian.net/browse/REMBEPSW-XXX
status: GREEN|YELLOW|RED
date: YYYY-MM-DDTHH:MM:SS
files_changed: X
insertions: Y
deletions: Z
quality_tools_passed: true|false
acceptance_criteria_met: X/Y
dor_status: GREEN|YELLOW|RED|N/A
---
```

### 6. Acceptance Criteria Check (Ticket Integration)

If the branch name contains a ticket number (pattern from config, default: `^[A-Z]+-\d+$`):

1. **Extract Ticket Number**
   - Parse ticket number from branch name (e.g., `REMBEPSW-123-feature-description`)
   - Support any ticket prefix matching the pattern

2. **Load Acceptance Criteria**
   - Try to load MR draft: `tickets/.mr-draft-{TICKET_ID}.md`
   - If not found, try to load via `glab mr view` (if glab is installed and MR exists)
   - If neither available, skip this section

3. **Compare Against Criteria**
   - Extract acceptance criteria from MR draft/description
   - For each criterion, assess if the code changes address it
   - Mark as: [MET], [PARTIALLY MET], [NOT MET], [CANNOT ASSESS]

4. **Generate Acceptance Criteria Report**

```markdown
### Acceptance Criteria Check

**Ticket:** {TICKET_ID}
**Jira:** {JIRA_BASE_URL}{TICKET_ID}

| Criterion | Status | Notes |
|-----------|--------|-------|
| [Criterion 1] | [MET] | Implemented in XxxService.php |
| [Criterion 2] | [PARTIALLY MET] | Missing edge case handling |
| [Criterion 3] | [NOT MET] | No related changes found |

**Coverage:** 2/3 criteria addressed

**Recommendations:**
- Address criterion 3 before creating MR
- Add test for edge case in criterion 2
```

If all criteria are met:
```
All acceptance criteria appear to be addressed. Ready for MR.
```

If criteria are missing:
```
Warning: Some acceptance criteria are not yet addressed.
Consider completing the implementation before creating the MR.
```

### 6.5 DoR Status Check (Optional)

If `tickets/.dor-{TICKET_ID}.md` exists:
- Load DoR evaluation result
- Include status in report header
- Show warning for non-GREEN status:

```markdown
### DoR Status

**Status:** [GREEN/YELLOW/RED]
**Score:** X/4 Must-Have criteria

[If YELLOW/RED:]
Warning: This ticket had DoR status {STATUS}.
Open questions from DoR evaluation should be clarified before merge.
```

### 7. Cursor Plan Mode Summary
At the end of the report, add a dedicated section for actionable implementation:

```markdown
## Cursor Plan Mode - Implementation Tasks

### High Priority Fixes
1. **Fix duplicate title extraction in AssetService.php**
   - Remove duplicate `$title = $asset->getProperty('title');` on line 67
   - Keep only the property loop extraction logic

2. **Refactor AssetPropertySortingService.php**
   - Extract common logic from `extractLanguages()` and `extractAssetInfotext()`
   - Create private `extractPropertyValue(array $typeList, string $key): ?string` method

### Medium Priority Improvements
3. **Optimize ProductController.php**
   - Batch multiple `removeFromTypeList()` calls into a single loop
   - Extract asset processing logic into separate method

4. **Add Unit Tests**
   - Create comprehensive test suite for `AssetPropertySortingService`
   - Test all public methods with edge cases and boundary conditions

### Code Quality Enhancements
5. **Add Input Validation**
   - Validate array structure in `AssetPropertySortingService` methods
   - Add type hints where missing

### Implementation Order
1. Start with high priority fixes (1-2)
2. Add unit tests (4) to prevent regressions
3. Implement optimizations (3)
4. Add quality enhancements (5)
```

### 8. Special Handling

**For different file types:**
- PHP files (src/, tests/): Full analysis
- Twig templates: Security (XSS), structure
- Config files (yaml, json): Syntax, security (no secrets)
- JavaScript files: Basic quality checks
- SQL/Migration files: Security, performance

**Smart Features:**
- Skip vendor/, node_modules/, cache/ directories
- Recognize Symfony/Pimcore patterns
- Detect common anti-patterns in Pimcore projects
- Suggest Pimcore best practices where applicable

### 9. Command Options
Support optional parameters:
- `/code-review` - Full review against origin/develop
- `/code-review --files-only` - Only list changed files
- `/code-review --quick` - Skip quality tools, only code analysis
- `/code-review --skip-ac` - Skip acceptance criteria check

## Important Notes

- All output in English
- Concrete code examples for improvements
- Grouped by file with clear severity indicators
- Integration with existing make commands from githook-config.json
- Actionable recommendations with code snippets
- Reports saved without emojis for professional documentation
- All reports automatically ignored by git via .gitignore

## Configuration

Settings are loaded from `.cursor/commands/ticket/config.yaml` if available.

| Setting | Default | Description |
|---------|---------|-------------|
| Ticket Pattern | `^[A-Z]+-\d+$` | Regex for ticket ID detection in branch names |
| Default Prefix | `REMBEPSW` | Default ticket prefix when only number is given |
| Jira Base URL | `https://netformic.atlassian.net/browse/` | Base URL for Jira ticket links |
| Report Path | `reports/code-review/` | Directory for saved reports |
| Base Branch | `origin/develop` | Branch to compare against |

### Override via Config

If `.cursor/commands/ticket/config.yaml` exists with different values, those take precedence.

Example config values used:
- `Jira Base URL` from config → used for ticket links
- `Ticket Pattern` from config → used for branch name parsing
- `Base Branch` from config → used for diff comparison
