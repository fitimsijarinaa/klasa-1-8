# Translation Key Naming Schema

Gilt für Data Objects (`var/classes/definition_*.php`) und **Objectbricks** (`var/classes/objectbricks/*.php`) in diesem Projekt.

## Format

```
{className}.{section}[.{subsection}][.{fieldName}]
```

## Rules

1. **className**  
   camelCase, matches the Pimcore class name:
   - Data Objects: e.g. `productCategory`, `dangerPictograms`, `administrativeSymbols` (aus `definition_<id>.php` → id/name in camelCase).
   - Objectbricks: e.g. `ruptureDisc` (Klasse `RuptureDisc`), `productDimensions`, `materialGasket`.

2. **section**  
   Layout element (tab/panel/region). Data Objects: often `information`. Others: `media`, `relations`, `settings`. Objectbricks may use sections like `general` or shared keys like `global.general`.

3. **subsection** (optional)  
   Fieldset or group name: `baseData`, `compactionUnitGroupSection`, etc.

4. **fieldName** (optional)  
   Must match the Pimcore field name: `designation`, `descriptionInternal`, `icon`, `surfaceShape`, `workingPressureRatio`, etc.

## Examples

### Data Objects

| Type | Key format | Example |
|------|------------|---------|
| Tab/Panel | `{class}.{section}` | `productCategory.information` |
| Fieldset | `{class}.{section}.{subsection}` | `productCategory.information.baseData` |
| Field | `{class}.{section}.{fieldName}` | `dangerPictograms.information.icon` |
| Field in fieldset | `{class}.{section}.{subsection}.{fieldName}` | `productCategory.information.baseData.designation` |

### Objectbricks

| Type | Key format | Example |
|------|------------|---------|
| Brick label (root title) | `{objectbrickClass}.title` | `ruptureDisc.title` |
| Panel (shared) | shared key | `global.general` |
| Field | `{objectbrickClass}.{fieldName}` | `ruptureDisc.surfaceShape`, `ruptureDisc.workingPressureRatio` |
| Field in panel | `{objectbrickClass}.{section}.{fieldName}` or flat | `ruptureDisc.workingPressureRatioText` |

Objectbrick class name is always camelCase from the PHP class (e.g. `RuptureDisc` → `ruptureDisc`).

## Validation

- Only alphanumeric characters and dots.
- camelCase for every segment.
- No German umlauts or special characters in the key.
- Hierarchy must match the layout structure (e.g. section before subsection).

## Namespace / Nicht überschreiben

- Keys, die bereits dem Muster **`Namespace.xyz`** folgen (z. B. `global.general`, `ruptureDisc.surfaceShape`), dürfen **nicht** geändert oder in Migrations überschrieben werden.
- **`global.*`** ist gemeinsamer Namespace und darf niemals überschrieben werden.
- Nur Felder ohne solchen Key (Plaintext oder invalide Keys) werden durch neue Keys ersetzt und diese neuen Keys in der Migration angelegt.

## Common Mistakes

- Plaintext instead of key: `'title' => 'Gefahrenpiktogramme'` → use `'title' => 'dangerPictograms.information'`. In objectbricks: `'title' => 'Burst Disc'` → use `'title' => 'ruptureDisc.title'`.
- Wrong order: `productClassification.baseData.information.title` → use `productClassification.information.baseData.designation` (and rename field to `designation`).
- Inconsistent field name: use `designation` for the main label field across Data Object classes, not `title`.
- Objectbrick: wrong casing in key (e.g. `ruptureDisc.LowFregmentation` – typo and inconsistent casing) → align with field name and fix spelling in key and in migrations.
