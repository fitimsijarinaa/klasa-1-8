# Smart Commit Command

Create an intelligent conventional commit with automatic ticket number extraction and commit type detection.

## Instructions

Execute the following steps to create a commit:

### 1. Branch Analysis
- Determine the current branch name with `git branch --show-current`
- Extract the ticket number from the branch name (Pattern: `REMBEPSW-\d+`)
- If no ticket number is found, check if the user provided a ticket number as parameter
- If user provided a ticket number (e.g., "42"), automatically generate the full ticket ID as "REMBEPSW-42"
- If no ticket number is found and none provided, issue a warning and ask the user for the ticket number

### 2. Git Status Check
- Execute `git status` to check if staged changes are present
- If no staged changes are present, inform the user and terminate the process

### 3. Git Diff Analysis
- Execute `git diff --cached` to analyze the staged changes
- Capture all modified files and their change types
- Analyze the nature of changes (new files, modified functions, bugfixes, etc.)

### 4. Automatically Determine Commit Type
Based on the diff analysis, determine the appropriate commit type:

- **feat**: New features, new files, new functions, new components
- **fix**: Bugfixes, error corrections, fixes to existing code
- **refactor**: Code restructuring without functional changes, function extraction
- **docs**: Documentation changes (*.md files, comments, README)
- **style**: Formatting, whitespace, code style changes without functional changes
- **test**: Test files, unit tests, integration tests
- **chore**: Build process, dependencies, configuration files, CI/CD
- **perf**: Performance improvements
- **ci**: CI/CD pipeline changes

### 5. Generate Commit Message
Create a detailed commit message in the format: `REMBEPSW-123: type: description`

**Description should contain:**
- Detailed description of the changes
- Can span multiple sentences/lines
- For complex changes: multi-line messages with bullet points
- Precise and technical language
- No emojis or "solve/close" phrases
- Focus on the "what" and "why" of the change

**Examples of good commit messages:**
```
REMBEPSW-123: feat: add responsive asset-teaser component

Implement new asset-teaser molecule with:
- Responsive grid layout for different screen sizes
- Image optimization with lazy loading
- Accessibility improvements with proper ARIA labels
- Integration with existing design system tokens

REMBEPSW-456: fix: correct text-container alignment in asset-teaser

Fix vertical alignment issue in text-container div that was causing
text to appear misaligned on mobile devices. Updated CSS flexbox
properties to ensure consistent alignment across all breakpoints.

REMBEPSW-789: refactor: extract twig macro for reusable card component

Extract common card layout logic into reusable twig macro to reduce
code duplication across multiple template files. This improves
maintainability and ensures consistent styling across components.
```

### 6. Create Commit
- Execute `git commit -m "generated_message"`
- Show confirmation with the created commit message

## Usage Examples

- `/commit` - Uses ticket number from branch name (e.g., REMBEPSW-123)
- `/commit 42` - Uses provided ticket number, generates REMBEPSW-42
- `/commit 456` - Uses provided ticket number, generates REMBEPSW-456

## Important Notes

- The command only works when changes are staged with `git add`
- Multiple commits can be created per ticket
- Ticket number can be provided as parameter or extracted from branch name (Format: REMBEPSW-123)
- When uncertain about commit type, choose the most conservative type
- For mixed change types, choose the main type of the change
