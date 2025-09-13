# agents-md

> Let's make [AGENTS.md](https://agents.md/) great again!  :joy:

## Overview

agents-md compose canonical `AGENTS.md` files from organized, sustainable, and configurable file structures. Designed to keep agent context up-to-date, dynamic, and shareable with your human documents.

We support:

- Multi‑file authoring
  - Write small partials anywhere or in a conventional folder
- Multi-level outputs
  - Compose inputs into one `AGENTS.md` per target directory while preserving "nearest wins" behavior unless configured otherwise. No duplicate outputs.
- Dynamic providers
  - Provide extra context from code, e.g. extract from JSDoc/TS, package.json scripts, config files, and more.

## Quick Start

1. Install with your preferred package manager, e.g.

    ```bash
    bun install agents-md -D
    ```

2. Initialize with:

    ```bash
    bun agents-md init
    ```

    This will move any existing `AGENTS.md` or `CLAUDE.md` files to `<"project" | directory-name>.agents.md` and scaffold a config file `agents-md.config.ts` to get started quickly.

    **Important**: `AGENTS.md` files are now codegen and managed by agents-md. ***We SHOULD NOT HAND-WRITE `AGENTS.md` files anymore***.

3. Write new documents or reshape existing ones in any of the following path formats:
   - `**/agents-md/*.md`
   - `**/*.agents.md`
   - `**/<configured-included-directories>/*.md`

  These files will be included in the composition process.

4. Compose `AGENTS.md` files with:

    ```bash
    bun agents-md compose
    ```

    This will codegen `AGENTS.md` file(s) from our inputs.

If we want to have multiple `AGENTS.md` files for dynamic location-based context, simply add a new empty `AGENTS.md` file in any target directory and rerun `bun agents-md compose`.

## Why agents-md?

Common pain points today:

- Single, static `AGENTS.md` per directory; no native "imports" or multi‑file composition.
- No glob‑based includes in `AGENTS.md` itself; no spec for dynamic content (e.g., JSDoc or config extraction).
- Some tools don't read `AGENTS.md`;
- Existing options like [Ruler](https://github.com/intellectronica/ruler) assume `.ruler/` and don't curate dynamic content outside of those directories.

agents-md focuses on improving flexibility and extensibility of `AGENTS.md`, while remaining compatible with code agents that don't read `AGENTS.md` directly.

## Features

- Codegen `AGENTS.md`
  - Generate or update `AGENTS.md` files, similar in spirit to Ruler's centralized approach—but more flexible.
- Multiple input file shims
  - Per‑directory file patterns:
    - `**/<input-name>.agents.md` (e.g., `setup.agents.md`, `testing.agents.md`)
    - `**/agents-md/**/*.md` (conventional folder for fragments)
- Central config `agents-md.config.ts` (optional)
  - Configurables
    - includes and excludes
    - providers
    - size budgets and truncations
    - output locations (default to the nearest sibling and parent `AGENTS.md`)
- Markdown comment directives
  - Directive comments may override the default behavior. For examples:
    - override the "nearest" output target to route a fragment file to the root `AGENTS.md`.
    - import a file

## CLI Commands

- init
  - Move any existing `AGENTS.md` files to `<"project" | directory-name>.agents.md`.
  - Scaffold a config file to get started quickly.
  - If `CLAUDE.md` exists, move it to `project.agents.md` and edit `CLAUDE.md` to onliner `@AGENTS.md`.
- compose
  - Compose partials and providers into one `AGENTS.md` per configured output. Preserves nearest‑wins semantics. See details at [How agents-md composes](#how-agents-md-composes).
- report
  - Report on the current state:
    - `AGENTS.md` files:
      - Directory tree
      - Size and token predictions
      - Warn with colorized output on over-size `AGENTS.md` and list their sourced inputs in descending order of size.
    - Bad comment directives
      - Missing imports
      - Missing targets
- help
- version

All commands have help subcommands.

### How agents-md composes

When you run `agents-md compose`, it will:

1. If missing `AGENTS.md` from root directory, create one.
1. Look for existing `AGENTS.md` files in the codebase. Use them as outputs.
1. Gather inputs (configurable via `agents-md.config.ts`):
    1. by `config.includeFiles` & `config.excludeFiles`, e.g.
       1. `**/agents-md/*.md`
       1. `**/*.agents.md`
    1. by `config.providers`
    1. by markdown comment directive imports
1. Group inputs by their target `AGENTS.md` based on the comment directives (highest priority), the config, and fallback to nearest wins policy.
1. Compose into target `AGENTS.md` files with source comments for their origin.

## Configuration

The `agents-md.config.ts` file provides fine-grained control over file discovery, content generation, and output behavior.

### Configuration Options Reference

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `includeFiles` | `(options) => boolean` | Function to determine which files to include | Built-in patterns |
| `excludeFiles` | `(options) => boolean` | Function to determine which files to exclude | Common ignore patterns |
| `providers` | `ProviderConfig[]` | Dynamic content providers to enable | `[]` (disabled) |
| `sizeBudgets.maxSize` | `number` | Maximum file size in bytes (hard limit). Truncates if it exceeds this size. | `100000` |
| `sizeBudgets.warnSize` | `number` | Warning threshold in bytes | `50000` |

### Basic Configuration Example

```ts
// agents-md.config.ts
export const config = () => {
  return {
    // File discovery patterns
    includeFiles: ({ path, currentDirectory }) => {
      return path.includes('/agents-md/') && path.endsWith('.md') ||
             path.endsWith('.agents.md') ||
             path.includes('/docs/agents/')  // custom directory
    },

    excludeFiles: ({ path, currentDirectory }) => {
      return path.includes('node_modules') ||
             path.includes('/.git/') ||
             path.includes('/secrets/') ||
             path.includes('/temp/')
    },

    // Size limits and warnings
    sizeBudgets: {
      maxSize: 100000,  // 100KB - hard limit
      warnSize: 50000   // 50KB - warning threshold
    },

    // Dynamic content providers (opt-in)
    providers: [
      { name: 'scripts', enabled: true },
      { name: 'jsdoc', enabled: false, options: { maxExports: 10 } },
      { name: 'ci', enabled: true },
      { name: 'lint', enabled: false }
    ]
  }
}
```

## Markdown Directives

Control composition behavior with HTML comment directives in your markdown files.

### Target Directive

Route a file to a specific output location instead of the default "nearest wins" behavior.

```md
<!-- agents-md: target=root -->
# My Global Documentation
This content will go to the root AGENTS.md file.
```

```md
<!-- agents-md: target=nearest -->
# Local Feature Docs
This content goes to the nearest AGENTS.md (default behavior).
```

**Target Values:**
- `root` - Route to root `./AGENTS.md`
- `nearest` - Route to nearest `AGENTS.md` (default)
- `./path/to/file.md` - Route to specific file path

### Import Directive

Include content from other files during composition.

```md
<!-- agents-md: import=@./shared/setup.md -->
<!-- agents-md: import=@./shared/common-patterns.md -->

# My Feature Documentation

This file will include the imported content above this section.
```

```md
<!-- agents-md: import=@../common/api-standards.md -->
<!-- This imports from a parent directory -->

# Package Documentation
The API standards will be included before this content.
```

**Import Path Rules:**
- Must start with `@` (required for Claude Code agent compatibility)
- Relative paths resolved from the importing file's directory
- Imported files are processed recursively (can contain their own directives)
- Import order matters - files are included in the order they appear

### Directive Examples

#### Multi-target composition
```md
<!-- In: features/auth.agents.md -->
<!-- agents-md: target=root -->

# Authentication System

Core authentication functionality for the entire application.

---

<!-- agents-md: target=./features/AGENTS.md -->

# Feature-specific Auth Details

Implementation details specific to this feature module.
```

#### Shared content with imports
```md
<!-- In: shared/common.agents.md -->
# Common Patterns

Standard patterns used across the project.

<!-- In: features/payments.agents.md -->
<!-- agents-md: import=@../shared/common.agents.md -->

# Payment Processing

This section includes common patterns above, plus payment-specific docs.
```

#### Conditional content
```md
<!-- agents-md: target=root -->
# Production Deployment Guide

<!-- agents-md: import=@./deployment/production.md -->
<!-- agents-md: import=@./deployment/monitoring.md -->

---

<!-- agents-md: target=./docs/AGENTS.md -->
# Development Setup

<!-- agents-md: import=@./deployment/development.md -->
<!-- agents-md: import=@./deployment/testing.md -->
```

### Best Practices

- **One directive per line** - Each directive should be on its own line for clarity
- **Place directives at the top** - Target directives work best when placed at the beginning of files
- **Import before content** - Place import directives before your main content
- **Use consistent paths** - Establish path conventions for your project
- **Test your directives** - Use `agents-md compose --dry-run` to preview results

## Dynamic Providers

- scripts provider
  - Reads package.json to propose Setup/Build/Test/Lint/Typecheck commands. No execution by default.
- ci provider
  - Surfaces canonical checks based on CI workflow files (e.g., how tests are run in CI).
- jsdocQuickFacts provider
  - Extracts a short "Quick API facts" section for key exports (names, roles, critical params). Not a full API dump.
- lint/format provider
  - Detects eslint/prettier configs and proposes relevant commands and conventions.

All providers prioritize brevity and clarity (copy/paste‑safe commands, minimal narrative). Providers aim to be deterministic and redaction‑aware.

## FAQ

- Why not just hand‑write `AGENTS.md`?
  - You can. agents‑md helps keep it organized and sustainable, especially when we want to share human readable files with agents.
- What about agents that don't read `AGENTS.md`?
  - Use the optional distribute step with Ruler to generate the appropriate files from the same source content.
- Do I need both local ./.agents-md.ts and a root config?
  - No. Many teams succeed with zero config or with a single root config. Local configs are for edge cases and package‑specific needs.
- Can Claude Code agent read `AGENTS.md`?
  - No. Best way to support it is to have `CLAUDE.md` with content:

    ```md
    @AGENTS.md # this will import the content of AGENTS.md
    ```

## Roadmap

- Provider framework for more dynamic content. E.g. jsdoc extractions.
- Better hot reloading supports for ecosystem tools
- MCP cross-directory reference support

## Credits

- OpenAI's efforts on `AGENTS.md` standardization.
- Inspired by [Ruler](https://github.com/intellectronica/ruler) for distribution to agents that don't read `AGENTS.md` directly.
