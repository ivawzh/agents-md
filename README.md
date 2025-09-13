# agents-md

> Let's make [AGENTS.md](https://agents.md/) great again! :joy:

Compose canonical `AGENTS.md` from sustainable file structures and plugins. Keep agent context current, composable, and shareable with your human docs.

## Why agents-md?

Common pain points today:

- Single, static `AGENTS.md` per directory; no native "imports" or multi‑file composition.
- No glob‑based includes in `AGENTS.md` itself; no spec for dynamic content (e.g., JSDoc or config extraction).
- Some tools don't read `AGENTS.md`;
- Existing options like [Ruler](https://github.com/intellectronica/ruler) assume `.ruler/` and don't curate dynamic content outside of those directories.

agents-md focuses on improving flexibility and extensibility of `AGENTS.md`, while remaining compatible with code agents that don't read `AGENTS.md` directly.

## Overview

- Inputs (fragment files): default Markdown files in `**/agents-md/**/*.md` and `**/*.agents.md`, plus plugin‑generated content. All file structures are configurable.
- Outputs (`AGENTS.md` target files): One `AGENTS.md` per target directory (nearest‑wins by default) with deterministic ordering and source annotations.
- Routing: Markdown directives and config rules map fragments to targets.
- Interop: Optional `CLAUDE.md` can import `@AGENTS.md` for tools that don't read `AGENTS.md`.

## Quick Start

- Install: `bun install -D agents-md` (npm/yarn/pnpm also work)
- Initialize: `bun agents-md init` (scaffolds config, migrates existing files)
- Compose: `bun agents-md compose` (generates `AGENTS.md` files)

Generated files are owned by agents-md. Don't hand‑edit `AGENTS.md` — edit fragments instead.

To have multiple `AGENTS.md` files for dynamic location-based context, simply add an empty `AGENTS.md` file in any target directory and rerun `bun agents-md compose`.

## Core Interfaces

### CLI

- `agents-md init`
  - Migrate any `AGENTS.md` or `CLAUDE.md` into fragments (e.g., `project.agents.md`).
  - Scaffold `agents-md.config.ts`.
- `agents-md compose [paths...]`
  - Build outputs from fragments and plugins.
- `agents-md report [--json] [--target <path|name>]`
  - Show outputs, sizes, token estimates, and warnings.
- `agents-md watch`
  - Rebuild on changes; mirrors `compose` flags.
- `agents-md help|version`

Exit codes: `0` success, `1` generic error, `2` invalid config, `3` composition differences with `--check`, `4` budget violation.

### Configuration

```ts
// agents-md.config.ts
export type AgentsMdConfig = {
  // Discovery
  include?: string[];              // Globs to include (default: ['**/agents-md/**/*.md', '**/*.agents.md'])
  exclude?: string[];              // Globs to ignore (node_modules, .git by default)
  includeFiles?: (ctx: { path: string; cwd: string }) => boolean; // Optional advanced filter

  // Targets and routing
  targets?: TargetRule[];          // Explicit outputs and selection rules
  defaultTarget?: 'nearest' | 'root';

  // Composition behavior
  order?: 'path' | 'weight' | 'explicit';
  dedupe?: false | 'content' | 'path';
  annotateSources?: boolean;       // Add source comments in outputs
  truncate?: { atCharacters?: number; strategy?: 'end' | 'middle' };

  // Budgets
  budgets?: {
    warnSourceCharacters?: number;
    maxSourceCharacters?: number;
    warnOutputCharacters?: number;
    maxOutputCharacters?: number;
  };

  // Plugins
  plugins?: Plugin[];
}

export type TargetRule = {
  name?: string;                   // logical name (e.g., 'root')
  path: string;                    // absolute or repo‑relative directory
  match?: string[];                // extra globs routed here
}

export type Plugin = {
  name: string;
  provides?: ('fragments' | 'metadata')[];
  scan?: (ctx: { cwd: string }) => AsyncIterable<Fragment>; // yields fragments
  validate?: (ctx: { cwd: string }) => Issue[];             // optional
  options?: Record<string, unknown>;
}

export type Fragment = {
  id?: string;                     // stable key for dedupe
  content: string;                 // markdown
  source: { path?: string; plugin?: string };
  target?: TargetSelector;         // per‑fragment override
  weight?: number;                 // sorting weight
}

export type TargetSelector = 'nearest' | 'root' | { path: string } | { name: string };
export type Issue = { level: 'warn' | 'error'; message: string; where?: string };
```

Defaults aim for zero‑config; override only what you need.

### Markdown Directives

- Target routing
  - `<!-- agents-md: target=nearest -->`
  - `<!-- agents-md: target=root -->`
  - `<!-- agents-md: target=../docs -->` (relative dir)
- Imports
  - `<!-- agents-md: import=@./shared/common.md -->`
  - `<!-- agents-md: import=@../standards/api.md -->`
- Ordering and metadata
  - `<!-- agents-md: weight=10 -->` (lower sorts first)
  - `<!-- agents-md: title="My Section" -->` (optional heading hint)

Rules: keys are comma/space separated (`key=value`); paths start with `@` for Claude Code compatibility; resolution is relative to the fragment file.

## Composition Model

- Discovery: collect fragments from `include` globs and plugin `scan()`.
- Targeting: directive > `targets` rules > `defaultTarget` (nearest).
- Ordering: by `weight`, then by path (stable and deterministic).
- Dedupe: optional by `content` or `path`.
- Annotation: optionally emit `<!-- source: path | plugin -->` comments.
- Output: write one `AGENTS.md` per selected target with a generated‑file banner.

## Reporting

- Shows: target tree, output sizes, token estimates, source counts, budget status.
- JSON mode: `agents-md report --json` for CI and tooling.
- `--check` with `compose` fails on diffs or budget violations (useful in CI).

## Interop & Migration

- `init` moves content from `AGENTS.md`/`CLAUDE.md` into fragments and scaffolds config.
- For Claude Code, create `CLAUDE.md` with: `@AGENTS.md` (imports generated content).
- Can be combined with distribution tools (e.g., Ruler) if needed.

## FAQ

- Why not hand‑write `AGENTS.md`? Fragments scale better, enable reuse, and keep context fresh via plugins.
- Do I need a local and a root config? No — start with zero‑config or a single root file.
- Are directives required? No — they only override defaults when needed.

## Roadmap

- Official plugin kit (JSDoc, TypeScript types, DB schemas).
- Better hot reload support for ecosystem tools.
- MCP for cross-directory reference support.

## Credits

- Thanks to OpenAI's `AGENTS.md` standardization efforts.
- Inspired by Ruler for distribution ideas.
