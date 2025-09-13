#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { compose } from '../core/compose'

export async function run(argv = process.argv.slice(2)) {
	return yargs(hideBin(['', '', ...argv]))
		.command(
			'compose',
			'compose AGENTS.md files',
			() => {},
			async () => {
				await compose({})
			},
		)
		.command(
			'report',
			'compose and report outputs',
			() => {},
			async () => {
				const outputs = await compose({})
				for (const o of outputs) {
					console.log(`${o.path} (${o.bytes} bytes)`)
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
