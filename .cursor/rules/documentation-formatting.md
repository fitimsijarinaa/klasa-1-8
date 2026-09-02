# Documentation Formatting Rules

## General Guidelines

### NO Emojis or Symbols
- **NEVER** use emojis (🎨, 📚, 🔧, etc.) in documentation
- **NEVER** use decorative symbols (✅, ❌, ⚠️, etc.) in documentation
- **NEVER** use special characters for visual emphasis (→, ←, ↑, ↓, etc.)

### Clean Formatting
- Use **bold** for emphasis instead of symbols
- Use *italics* for secondary emphasis
- Use `code blocks` for technical terms
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for sequences

## Examples

### ❌ WRONG
```markdown
### 🎨 **Interactive Documentation**
- ✅ **Live GraphQL Playground** - Test queries directly
- 🔧 **Schema Explorer** - Navigate through types
- 📚 **Search Functionality** - Find types quickly
```

### ✅ CORRECT
```markdown
### Interactive Documentation
- **Live GraphQL Playground** - Test queries directly
- **Schema Explorer** - Navigate through types
- **Search Functionality** - Find types quickly
```

### ❌ WRONG
```markdown
## ✅ **Perfekt konfiguriert!**
Die .gitignore ist bereits korrekt eingerichtet:
- ✅ **Sie können weiterhin Obsidian verwenden**
- ✅ **Keine IDE-Dateien im Repository**
```

### ✅ CORRECT
```markdown
## Configuration Complete
The .gitignore is properly configured:
- **Obsidian Integration** - Continue using Obsidian
- **Clean Repository** - No IDE files in version control
```

## Technical Documentation Standards

### Headers
- Use clear, descriptive headers
- No decorative elements
- Focus on content clarity

### Tags (Obsidian Compatibility)
- **NO spaces** in tags - use hyphens (-) or underscores (_)
- **Prefer hyphens** over underscores for consistency
- **Lowercase** for better compatibility
- **Examples:**
  - ✅ `api-testing` (correct)
  - ✅ `graphql-docs` (correct)
  - ❌ `API Testing` (incorrect - has spaces)
  - ❌ `graphql_docs` (acceptable but prefer hyphens)

### Lists
- Use standard bullet points (-)
- Use numbered lists for procedures
- Keep items concise and actionable

### Code Blocks
- Use appropriate language tags
- Include context and explanations
- Keep examples practical and relevant

### Status Indicators
- Use text-based status: "Complete", "In Progress", "Pending"
- Avoid checkmarks, crosses, or other symbols
- Be clear and professional

## Enforcement

This rule applies to:
- All Markdown documentation files
- README files
- Technical specifications
- API documentation
- User guides
- Any written documentation in the project

The goal is professional, clean, and accessible documentation that focuses on content rather than visual decoration.
