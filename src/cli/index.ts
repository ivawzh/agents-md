#!/usr/bin/env node
import yargs, { type ArgumentsCamelCase, type Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { compose } from '../core/compose'
import { loadConfig } from '../core/config'
import { formatChars } from '../core/format'
import { init } from '../core/init'
import { createAgentsMdPrefix } from '../core/logger'
import { summarize } from '../core/report'
import { setupHook } from '../core/setup'
import { watch } from '../core/watch'

export async function run(
	argv: string[] = process.argv.slice(2),
): Promise<unknown> {
	return yargs(hideBin(['', '', ...argv]))
		.command(
			'init',
			'Setup agents-md in your project',
			() => {},
			async () => {
				const config = await loadConfig(process.cwd())
				const outputs = await init(config)
				for (const o of outputs) {
					console.log(
						`${createAgentsMdPrefix()}: ✓ Created ${o.path} (${formatChars(o.chars)} chars)`,
					)
				}
				const summary = summarize(outputs, config)
				if (summary.limits) {
					for (const d of summary.limits.details)
						console.warn(`${createAgentsMdPrefix()}: ⚠️  ${d}`)
					if (summary.limits.violated) process.exitCode = 4
				}
			},
		)
		.command(
			'compose',
			'Generate AGENTS.md from source files',
			() => {},
			async () => {
				const config = await loadConfig(process.cwd())
				const outputs = await compose(config)
				for (const o of outputs) {
					console.log(
						`${createAgentsMdPrefix()}: ✓ Created ${o.path} (${formatChars(o.chars)} chars)`,
					)
				}
				const summary = summarize(outputs, config)
				if (summary.limits) {
					for (const d of summary.limits.details)
						console.warn(`${createAgentsMdPrefix()}: ⚠️  ${d}`)
					if (summary.limits.violated) process.exitCode = 4
				}
			},
		)
		.command(
			'report',
			'Show statistics about generated files',
			(y: Argv) => y.option('json', { type: 'boolean' }),
			async (args: ArgumentsCamelCase<{ json?: boolean }>) => {
				const config = await loadConfig(process.cwd())
				const outputs = await compose(config)
				const summary = summarize(outputs, config)
				if (args.json) {
					console.log(JSON.stringify(summary, null, 2))
				} else {
					for (const o of summary.outputs) {
						const name = o.path === 'AGENTS.md' ? 'AGENTS.md (main)' : o.path
						console.log(
							`${createAgentsMdPrefix()}: 📄 ${name} - ${formatChars(o.chars)} chars from ${o.sources.length} source${o.sources.length === 1 ? '' : 's'}`,
						)
					}
					console.log(
						`${createAgentsMdPrefix()}: 📊 Summary: ${summary.totals.outputs} file${summary.totals.outputs === 1 ? '' : 's'}, ${formatChars(summary.totals.chars)} chars total, ${summary.totals.sources} source${summary.totals.sources === 1 ? '' : 's'}`,
					)
					if (summary.limits) {
						for (const d of summary.limits.details)
							console.warn(`${createAgentsMdPrefix()}: ⚠️  ${d}`)
					}
				}
				if (summary.limits?.violated) process.exitCode = 4
			},
		)
		.command(
			'watch',
			'Auto-regenerate when files change',
			(y: Argv) => y.option('verbose', { type: 'boolean' }),
			async (args: ArgumentsCamelCase<{ verbose?: boolean }>) => {
				const config = await loadConfig(process.cwd())
				await watch({ ...config, verbose: args.verbose })
			},
		)
		.command(
			'setup:compose-before-commit',
			'Setup pre-commit hook to auto-compose AGENTS.md files (works with any codebase)',
			() => {},
			async () => {
				const result = await setupHook({
					cwd: process.cwd(),
					hookType: 'compose-before-commit',
				})
				if (result.success) {
					console.log(`${createAgentsMdPrefix()}: ✓ ${result.message}`)
				} else {
					console.error(`${createAgentsMdPrefix()}: ✗ ${result.message}`)
					process.exitCode = 1
				}
			},
		)
		.demandCommand()
		.help()
		.parseAsync()
}

if (import.meta.main) {
	run()
}
