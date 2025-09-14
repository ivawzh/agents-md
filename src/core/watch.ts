import fs from 'node:fs'
import { compose } from './compose'
import { formatChars } from './format'
import type { AgentsMdConfig } from './types'

export async function watch(
	config: AgentsMdConfig & { cwd?: string } = {},
): Promise<never> {
	const cwd = config.cwd ?? process.cwd()

	const run = async () => {
		const outputs = await compose({ ...config, cwd })
		for (const o of outputs) {
			console.log(`wrote ${o.path} (${formatChars(o.chars)} chars)`)
		}
	}

	await run()
	console.log('Watching for changes...')
	let timer: NodeJS.Timeout | undefined
	fs.watch(cwd, { recursive: true }, () => {
		clearTimeout(timer)
		timer = setTimeout(run, 200)
	})

	return new Promise(() => {})
}
