#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { compose } from '../core/compose'
import { init } from '../core/init'
import { summarize } from '../core/report'
import { watch } from '../core/watch'

export async function run(argv = process.argv.slice(2)) {
	return yargs(hideBin(['', '', ...argv]))
		.command(
			'init',
			'initialize agents-md in this project',
			() => {},
			async () => {
				const outputs = await init({})
				for (const o of outputs) {
					console.log(`wrote ${o.path} (${o.chars} chars)`)
				}
			},
		)
		.command(
			'compose',
			'compose AGENTS.md files',
			() => {},
			async () => {
				const outputs = await compose({})
				for (const o of outputs) {
					console.log(`wrote ${o.path} (${o.chars} chars)`)
				}
			},
		)
		.command(
			'report',
			'compose and report outputs',
			(y) => y.option('json', { type: 'boolean' }),
			async (args) => {
				const outputs = await compose({})
				const summary = summarize(outputs)
				if (args.json) {
					console.log(JSON.stringify(summary, null, 2))
				} else {
					for (const o of summary.outputs) {
						console.log(
							`${o.path} - ${o.chars} chars from ${o.sources.length} sources`,
						)
					}
					console.log(
						`Totals: ${summary.totals.outputs} files, ${summary.totals.chars} chars, ${summary.totals.sources} sources`,
					)
				}
			},
		)
		.command(
			'watch',
			'watch and recompose on changes',
			() => {},
			async () => {
				await watch({})
			},
		)
		.demandCommand()
		.help()
		.parseAsync()
}

if (import.meta.main) {
	run()
}
