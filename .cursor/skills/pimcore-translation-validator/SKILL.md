---
name: pimcore-translation-validator
description: Validates Pimcore class and objectbrick definition files for translation key schema compliance. Use when checking var/classes/definition_*.php or var/classes/objectbricks/*.php, finding plaintext labels, or creating translation migrations.
---

# Pimcore Translation Key Validator

Validates Pimcore Data Object class definitions against the project's translation key naming schema and helps fix issues or generate migrations.

## When to Use

- Reviewing or adding class definitions in `var/classes/definition_*.php` (Data Objects)
- Reviewing or adding objectbrick definitions in `var/classes/objectbricks/*.php`
- Finding labels that use plaintext instead of translation keys
- Checking that translation keys follow the naming schema
- Creating or updating admin translation migrations in `src/Migration/`

## Relevant Paths (this project)

| Type            | Location                          | File pattern / example        |
|----------------|-----------------------------------|--------------------------------|
| Data Objects   | `var/classes/`                    | `definition_<id>.php` (e.g. `definition_product.php`) |
| Objectbricks   | `var/classes/objectbricks/`       | `<ClassName>.php` (e.g. `RuptureDisc.php`)           |
| Migrations     | `src/Migration/`                  | `VersionYYYYMMDDHHMMSS.php`, extends `AbstractTranslationMigration` |

## Naming Schema

Keys must follow this pattern:

```
{className}.{section}[.{subsection}][.{fieldName}]
```

- **className**: camelCase, matches Pimcore class name (e.g. `productCategory`, `ruptureDisc` for objectbrick RuptureDisc)
- **section**: Layout area, often `information` for Data Objects; objectbricks may use sections like `general` or shared keys like `global.general`
- **subsection** (optional): Fieldset or group (e.g. `baseData`, `compactionUnitGroupSection`)
- **fieldName** (optional): Data field name (e.g. `designation`, `surfaceShape`, `workingPressureRatio`)

Rules: only letters, numbers, dots; camelCase segments; no umlauts or spaces. Hierarchy must match the actual layout (e.g. section before subsection).

See [NAMING-SCHEMA.md](NAMING-SCHEMA.md) for full rules and examples.

## Namespace and overwrite rules

**Bestehende Keys mit Namespace nicht ändern**

- Ein Translation Key gilt als „vorhanden / namespaced“, wenn er dem Muster **`Namespace.xyz`** folgt (mindestens ein Punkt, z. B. `global.general`, `ruptureDisc.surfaceShape`, `productCategory.information`).
- Solche Keys **dürfen in den Definitionen nicht geändert werden** – sie bleiben unverändert.
- **`global.*`-Keys** (z. B. `global.general`) sind gemeinsame Keys und **dürfen niemals überschrieben werden** – weder in Definitionen noch in Migrations (nicht in der Migration anlegen/ändern).

**Nur Felder ohne Namespace-Key anpassen**

- Felder, die **keinen** namespaced Key haben (Plaintext wie `'title' => 'Burst Disc'` oder leere/invalide Keys), sollen angepasst werden:
  - In der Definition: `'title'` durch den passenden neuen Key ersetzen (z. B. `ruptureDisc.title`).
  - In der Migration: **nur diese neuen Keys** anlegen (mit `de`/`en`). Keine bestehenden Keys mit Muster `Namespace.xyz` in der Migration hinzufügen oder überschreiben.

**Kurz**

| Situation | In Definition | In Migration |
|-----------|----------------|--------------|
| Key existiert, Muster `Namespace.xyz` (inkl. `global.xyz`) | **Nicht ändern** | **Nicht anlegen / nicht überschreiben** |
| Plaintext oder kein Namespace-Key | Durch neuen Key ersetzen | Neuen Key anlegen |

## Objectbricks

- **Definition files**: `var/classes/objectbricks/<ClassName>.php` (e.g. `RuptureDisc.php`). They use `\Pimcore\Model\DataObject\Objectbrick\Definition::__set_state(array(...))` and contain the same layout structure (Panel, children with `'title'`).
- **Naming**: Use the objectbrick class name in camelCase as the first segment (e.g. `ruptureDisc.surfaceShape`, `ruptureDisc.workingPressureRatio`). Shared panel titles (e.g. `global.general`) are allowed.
- **Root-level** `'title'` on the brick definition is the brick label in the backend; prefer translation keys here (e.g. `'title' => 'ruptureDisc.title'` instead of `'Burst Disc'`). The **`group`** property is **ignored** by this skill (nicht validieren, nicht in Migration anlegen).
- **Validation**: Same as Data Objects – no plaintext in field/layout `title`; keys must follow the schema and match hierarchy. Die Eigenschaft **`group`** (z. B. bei Objectbricks) wird **ignoriert** – nicht validieren, nicht in Migrations anlegen.

## Validation Steps

1. **Scan for plaintext / fehlenden Namespace**  
   In each definition file (Data Object and objectbrick), search for `'title' => '` followed by German/English text (e.g. "Bezeichnung", "Burst Disc") or keys without namespace (kein Muster `Namespace.xyz`). **Nur diese** durch den passenden Key ersetzen. Bereits vorhandene Keys, die dem Muster `Namespace.xyz` folgen (z. B. `global.general`, `ruptureDisc.surfaceShape`), **nicht** ändern.

2. **Check key hierarchy**  
   For fields inside a fieldset, the key must be `{class}.{section}.{subsection}.{fieldName}`. Wrong order (e.g. `baseData.information` instead of `information.baseData`) must be corrected.

3. **Check field names**  
   Use consistent field names across classes (e.g. `designation` for the main label, not `title`). In objectbricks, match the PHP field name (e.g. `surfaceShape` → `ruptureDisc.surfaceShape`).

4. **Objectbricks**  
   In `var/classes/objectbricks/*.php`, ensure every layout/field `title` is a key (or empty string where appropriate). Fix typos in keys (e.g. `ruptureDisc.LowFregmentation` → correct spelling in key and migration).

## Generating a Migration

When adding or fixing translations (only for **new** keys that replaced plaintext in definitions):

1. Use `App\Migration\AbstractTranslationMigration` as base (in `src/Migration/`).
2. **Leave `protected const OVERWRITE = false`** so existing keys (including `global.*` and any `Namespace.xyz`) are never overwritten. Only new keys that do not yet exist in the DB will be inserted.
3. Add **only the new keys** to `$translations[Translation::DOMAIN_ADMIN]` with `de` and `en` entries. Do **not** add or overwrite keys that already follow the pattern `Namespace.xyz` (especially not `global.*`).
4. If obsolete keys exist (e.g. after renaming), override `up()`: first delete only those obsolete keys via `Translation::getByKey(...)->delete()`, then call `parent::up($schema)`. Do not delete `global.*` or other existing namespaced keys.

5. **Im Migrations-File** im Klassen-Docblock den Ausführbefehl angeben:
   ```php
   /**
    * Kurzbeschreibung der Migration.
    * bin/console doctrine:migrations:execute --up 'App\Migration\VersionYYYYMMDDHHMMSS'
    */
   ```
   Ersetze `VersionYYYYMMDDHHMMSS` durch den konkreten Klassennamen der Migration.

Migration class name: `VersionYYYYMMDDHHMMSS` in `src/Migration/`.

## Quick Reference

| Issue | Action |
|-------|--------|
| Key bereits `Namespace.xyz` (z. B. `global.general`, `ruptureDisc.surfaceShape`) | **Nicht ändern** (Definition + Migration) |
| `global.*`-Keys | **Niemals überschreiben oder in Migration anlegen** |
| Plaintext in `title` | In Definition durch Key ersetzen; **nur diesen** neuen Key in Migration anlegen |
| Felder ohne Namespace-Key | In Definition Key setzen, in Migration nur neue Keys eintragen |
| Wrong key order | Nur anpassen, wenn aktuell kein gültiger Namespace-Key (sonst nicht ändern) |
| Obsolete keys in DB | Nur konkrete obsolete Keys in `up()` löschen; `global.*`/bestehende Namespace-Keys nicht löschen |
| Eigenschaft `group` | **Ignorieren** – weder validieren noch in Migration anlegen |
| Neue Migration anlegen | Docblock mit `bin/console doctrine:migrations:execute --up 'App\Migration\VersionYYYYMMDDHHMMSS'` im File ergänzen |
