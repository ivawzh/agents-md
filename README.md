### agents-md

Let's make [AGENTS.md](https://agents.md/) great again :joy:

Compose canonical `AGENTS.md` files from organised, sustatainable, and configurable file structures. Designed to keep agent context up-to-date, dynamic, and shareable with your human documents.

### Get started

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

### Why agents-md?

Common pain points today:

- Single, static `AGENTS.md` per directory; no native "imports" or multi‑file composition.
- No glob‑based includes in `AGENTS.md` itself; no spec for dynamic content (e.g., JSDoc or config extraction).
- Some tools don't read `AGENTS.md`;
- Existing options like [Ruler](https://github.com/intellectronica/ruler) assume `.ruler/` and don't curate dynamic content outside of those directories.

agents-md focuses on flexibility and extensibility of ``AGENTS.md``, while remaining compatible with code agents that don't read `AGENTS.md` directly.

### What it does

- Multi‑file authoring
  - Write small partials anywhere or in a conventional folder
- multi-level outputs
  - Compose inputs into one `AGENTS.md` per target directory (root and/or any directories).
- Preserves "nearest wins" behavior
  - inputs will be grouped into its nearest `AGENTS.md` unless configured otherwise. No duplicate outputs.
- Optional dynamic providers
  - Propose extra context sections based on your repo, e.g. package.json scripts, config files, and quick API facts via JSDoc/TS. Customizable, common syntax in the output.

### Features at a glance

- Codegen `AGENTS.md`
  - Generate or update a root‑level `AGENTS.md`, similar in spirit to Ruler's centralized approach—but focused on content curation over distribution.
- Multiple input file shims
  - Per‑directory file patterns:
    - `**/<input-name>.agents.md` (e.g., `setup.agents.md`, `testing.agents.md`)
    - `**/agents-md/**/*.md` (conventional folder for fragments)
- Central config `agents-md.config.ts` (optional)
  - Configurables
    - extra includes
    - excludes
    - extra providers
    - size budgets and truncations
    - output locations (default to the nearest sibling and parent `AGENTS.md`)
- Markdown comment directives
  - Directive comments may override the default behavior. For examples:
    - override the "nearest" output target to route a fragment file to the root `AGENTS.md`.
    - import a file

### How agents-md composes content

When you run `agents-md compose`, it will:

1. If missing `AGENTS.md` from root directory, create one.
1. Look for existing `AGENTS.md` files in the codebase. Use them as outputs.
1. Gather inputs with the following precedence:
    1. `**/agents-md/*.md` in sorted order
    1. `**/*.agents.md` in sorted order
    1. config.includeFiles
    1. config.providers
    1. markdown comment directive imports
1. Group inputs by their target `AGENTS.md` based on the comment directives (highest priority), the config, and fallback to nearest wins policy.
1. Compose into target `AGENTS.md` files with source comments for their origin.

### Configuration

#### Example: `agents-md.config.ts`

```ts
// agents-md.config.ts
export const config = () => {
  const includedDirectories = [
    /\/(agents-md)\//, // default
    /\/(designs)\//, // additional directory
  ];
  const excludedDirectories = [
    /\/(secrets)\//,
  ];
  return {
    includeFiles: ({ path, currentDirectory }) => includedDirectories.some(directory => path.match(directory)),
    excludeFiles: ({ path, currentDirectory }) => excludedDirectories.some(directory => path.match(directory)),
  };
};
```

### Markdown comment directives

```md
<!-- agents-md: target=root|nearest| -->
```

```md
<!-- agents-md: import=@./agents-md/index.md -->
```

Notes:

- Import path have to start with `@` to support Claude Code agent.
- Dynamic providers (below) are off by default; enable explicitly in config.

### Dynamic providers (opt‑in)

- scripts provider
  - Reads package.json to propose Setup/Build/Test/Lint/Typecheck commands. No execution by default.
- ci provider
  - Surfaces canonical checks based on CI workflow files (e.g., how tests are run in CI).
- jsdocQuickFacts provider
  - Extracts a short "Quick API facts" section for key exports (names, roles, critical params). Not a full API dump.
- lint/format provider
  - Detects eslint/prettier configs and proposes relevant commands and conventions.

All providers prioritize brevity and clarity (copy/paste‑safe commands, minimal narrative). Providers aim to be deterministic and redaction‑aware.

### CLI overview

- init
  - Move any existing `AGENTS.md` files to `<"project" | directory-name>.agents.md`.
  - Scaffold a config file to get started quickly.
  - If `CLAUDE.md` exists, move it to `project.agents.md` and edit `CLAUDE.md` to onliner `@AGENTS.md`.
- compose
  - Compose partials and providers into one `AGENTS.md` per configured output. Preserves nearest‑wins semantics. See details at [How agents-md composes content](#how-agents-md-composes-content).
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

### FAQ

- Why not just hand‑write `AGENTS.md`?
  - You can. agents‑md helps keep it organized and sustatainable, especially when we want to share human readable files with agents.
- What about agents that don't read `AGENTS.md`?
  - Use the optional distribute step with Ruler to generate the appropriate files from the same source content.
- Do I need both local ./.agents-md.ts and a root config?
  - No. Many teams succeed with zero config or with a single root config. Local configs are for edge cases and package‑specific needs.
- Can Claude Code agent read `AGENTS.md`?
  - No. Best way to support it is to have `CLAUDE.md` with content:

    ```md
    @AGENTS.md # this will import the content of AGENTS.md
    ```

### Roadmap

- Better hot reloading supports for ecosystem tools
- MCP cross-directory reference support

### Credits

- OpenAI's efforts on `AGENTS.md` standardization.
- Inspired by [Ruler](https://github.com/intellectronica/ruler) for distribution to agents that don't read `AGENTS.md` directly.
