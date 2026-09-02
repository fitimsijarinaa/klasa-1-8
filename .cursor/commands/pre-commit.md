# Pre-Commit Command

Execute pre-commit hooks as defined in githook-config.json using make commands.

## Instructions

Execute the following steps to run pre-commit checks:

### 1. Read Git Hook Configuration
- Read the `githook-config.json` file from the project root
- Parse the JSON configuration to extract the "pre-commit" array
- If the file doesn't exist or "pre-commit" key is missing, inform the user and exit

### 2. Execute Pre-Commit Commands
- For each command in the "pre-commit" array, execute it as a make command
- Run `make <command-name>` for each entry
- If any command fails, stop execution and report the failure
- Show progress for each command being executed

### 3. Report Results
- Display a summary of all executed commands
- Show which commands passed and which failed (if any)
- Provide clear feedback on the overall pre-commit status

## Example Configuration
Based on the current `githook-config.json`:
```json
{
  "pre-commit": ["php-lint","phpcs","phpstan"],
  "pre-push": ["phpunit-unit"]
}
```

This will execute:
- `make php-lint`
- `make phpcs` 
- `make phpstan`

## Usage Examples

- `/pre-commit` - Runs all pre-commit hooks defined in githook-config.json

## Important Notes

- Commands are executed in the order they appear in the configuration
- If any command fails, the process stops and reports the failure
- All commands are executed as make targets
- The configuration file must be valid JSON
- Commands must be defined as make targets in the project's Makefile
