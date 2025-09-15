#!/usr/bin/env node
import yargs, { type ArgumentsCamelCase, type Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { compose } from '../core/compose'
import { loadConfig } from '../core/config'
import { formatChars } from '../core/format'
import { init } from '../core/init'
import { summarize } from '../core/report'
import { watch } from '../core/watch'

export async function run(
	argv: string[] = process.argv.slice(2),
): Promise<unknown> {
	return yargs(hideBin(['', '', ...argv]))
		.command(
			'init',
			'initialize agents-md in this project',
			() => {},
			async () => {
				const config = await loadConfig(process.cwd())
				const outputs = await init(config)
				for (const o of outputs) {
					console.log(`wrote ${o.path} (${formatChars(o.chars)} chars)`)
				}
				const summary = summarize(outputs, config)
				if (summary.limits) {
					for (const d of summary.limits.details) console.warn(d)
					if (summary.limits.violated) process.exitCode = 4
				}
			},
		)
		.command(
			'compose',
			'compose AGENTS.md files',
			() => {},
			async () => {
				const config = await loadConfig(process.cwd())
				const outputs = await compose(config)
				for (const o of outputs) {
					console.log(`wrote ${o.path} (${formatChars(o.chars)} chars)`)
				}
				const summary = summarize(outputs, config)
				if (summary.limits) {
					for (const d of summary.limits.details) console.warn(d)
					if (summary.limits.violated) process.exitCode = 4
				}
			},
		)
		.command(
			'report',
			'compose and report outputs',
			(y: Argv) => y.option('json', { type: 'boolean' }),
			async (args: ArgumentsCamelCase<{ json?: boolean }>) => {
				const config = await loadConfig(process.cwd())
				const outputs = await compose(config)
				const summary = summarize(outputs, config)
				if (args.json) {
					console.log(JSON.stringify(summary, null, 2))
				} else {
					for (const o of summary.outputs) {
						const name = o.path === 'AGENTS.md' ? 'AGENTS.md (root)' : o.path
						console.log(
							`${name} - ${formatChars(o.chars)} chars from ${o.sources.length} sources`,
						)
					}
					console.log(
						`Totals: ${summary.totals.outputs} AGENTS.md files, ${formatChars(summary.totals.chars)} chars, ${summary.totals.sources} sources`,
					)
					if (summary.limits) {
						for (const d of summary.limits.details) console.warn(d)
					}
				}
				if (summary.limits?.violated) process.exitCode = 4
			},
		)
		.command(
			'watch',
			'watch and recompose on changes',
			() => {},
			async () => {
				const config = await loadConfig(process.cwd())
				await watch(config)
			},
		)
		.demandCommand()
		.help()
		.parseAsync()
}

if (import.meta.main) {
	run()
}
