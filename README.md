# agents-md

> Let's make [AGENTS.md](https://agents.md/) great again! :joy:

Compose canonical `AGENTS.md` from sustainable and elegant file structures. Keep agent context current, composable, and shareable with your human docs. Abstract-context-as-code is what we aim to achieve.

## Why agents-md?

Common pain points today:

- Single, static `AGENTS.md` per directory; no native "imports" or multi‑file composition.
- No glob‑based includes in `AGENTS.md` itself; no spec for dynamic content (e.g., JSDoc or config extraction).
- Some tools don't read `AGENTS.md`;
- Existing options like [Ruler](https://github.com/intellectronica/ruler) assume `.ruler/` and don't curate dynamic content outside of those directories.

agents-md focuses on improving flexibility and extensibility of `AGENTS.md`, while remaining compatible with code agents that don't read `AGENTS.md` directly.

## Overview

- Inputs (fragment files): default Markdown files in `**/agents-md/**/*.md` and `**/*.agents.md`. All file structures are configurable.
- Outputs (`AGENTS.md` target files): One `AGENTS.md` per target directory (nearest‑wins by default) with deterministic ordering and source annotations.
- Routing: Markdown directives map fragments to targets.
- Interop: Optional `CLAUDE.md` can import `@AGENTS.md` for tools that don't read `AGENTS.md`.

## Quick Start

- Install: `bun install -D agents-md` (or `npm i -D`, `pnpm add -D`, `yarn add -D`)
- Initialize: `bun agents-md init`
- Update fragment files in any of these path formats:
  - `**/agents-md/**/*.md`
  - `**/*.agents.md`
  - `**/<customised-directories>/*.md`
  - `**/*.<customised-file-formats>`
- Compose: `bun agents-md compose`

Generated files are owned by agents-md. Don't hand‑edit `AGENTS.md` — edit fragments instead.

To have multiple `AGENTS.md` files for dynamic location-based context, simply add an empty `AGENTS.md` file in any target directory and rerun `bun agents-md compose`.

## CLI

- `agents-md init`
  - Initialize agents-md in this project.
- `agents-md compose`
  - Build outputs from fragments.
- `agents-md report [--json]`
  - Show outputs, sizes (k chars), token estimates, and warnings (use `--json` for CI).
- `agents-md watch`
  - Rebuild on changes.
- `agents-md help|version`

Exit codes: `0` success, `1` generic error, `2` invalid config, `4` limit violation.

## Configuration

Use `agents-md.config.ts` (or `.js/.mjs`) at repo root. Defaults are zero‑config; customize only as needed. See full schema in `docs/design.md`.

Key options

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `include` | `string[]` | `['**/agents-md/**/*.md','**/*.agents.md']` | Fragment discovery globs |
| `exclude` | `string[]` | `['**/node_modules/**','**/.git/**']` | Ignore patterns |
| `includeFiles` | `(ctx) => boolean` | `undefined` | Advanced per‑file filter |
| `defaultTarget` | `'nearest'|'root'` | `'nearest'` | Fallback routing behavior |
| `annotateSources` | `boolean` | `true` | Wrap fragments with `<!-- source: ... -->` / `<!-- /source: ... -->` comments |
| `truncate` | `{ atChars, strategy }` | `undefined` | Trim oversized outputs |
| `limits` | `{ warn/max source/output }` | `undefined` | Size limits and warnings |

### Markdown Directives

- Target routing
  - `<!-- agents-md: target=nearest -->`
  - `<!-- agents-md: target=root -->`
  - `<!-- agents-md: target=../docs -->` (relative dir)
- Imports
  - `<!-- agents-md: import=@./shared/common.md -->`
  - `<!-- agents-md: import=@../standards/api.md -->`
- Ordering and metadata
  - `<!-- agents-md: weight=10 -->` (lower numbers surface earlier)
  - `<!-- agents-md: title="My Section" -->` (optional heading hint)

Rules: keys are comma/space separated (`key=value`); paths start with `@` for Claude Code compatibility; resolution is relative to the fragment file.

## Composition Model

- Discovery: collect fragments from `include` globs.
- Targeting: directive > `defaultTarget` (nearest).
- Ordering: by `weight` (ascending), then by path (stable and deterministic).
- Annotation: optionally wrap fragments with `<!-- source: path -->` and `<!-- /source: path -->` comments.
- Output: write one `AGENTS.md` per selected target with a generated‑file banner.

## Reporting

- Shows: target tree, output sizes, token estimates, source counts, limit status.
- JSON mode: `agents-md report --json` for CI and tooling.


## Interop & Migration

- `init` moves content from `AGENTS.md`/`CLAUDE.md` into fragments and scaffolds config.
- For Claude Code, create `CLAUDE.md` with: `@AGENTS.md` (imports generated content).
- Can be combined with distribution tools (e.g., Ruler) if needed.

## FAQ

- Why not hand‑write `AGENTS.md`? Fragments scale better and enable reuse.
- Do I need a local and a root config? No — start with zero‑config or a single root file.
- Are directives required? No — they only override defaults when needed.

## Roadmap

- Official plugin kit (JSDoc, TypeScript types, DB schemas).
- Better hot reload support for ecosystem tools.
- MCP for cross-directory reference support.

## Credits

- Thanks to OpenAI's `AGENTS.md` standardization efforts.
- Inspired by Ruler for distribution ideas.
