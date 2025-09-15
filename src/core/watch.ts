import fs from 'node:fs'
import path from 'node:path'
import { compose } from './compose'
import { formatChars } from './format'
import type { AgentsMdConfig } from './types'

export async function watch(
	config: AgentsMdConfig & { cwd?: string } = {},
): Promise<never> {
	const cwd = config.cwd ?? process.cwd()

	let written = new Set<string>()

	const run = async () => {
		const outputs = await compose({ ...config, cwd })
		written = new Set(outputs.map((o) => o.path))
		for (const o of outputs) {
			console.log(`wrote ${o.path} (${formatChars(o.chars)} chars)`)
		}
	}

	await run()
	console.log('Watching for changes...')
	let timer: NodeJS.Timeout | undefined
	fs.watch(cwd, { recursive: true }, (_e, file) => {
		const rel = file?.split(path.sep).join('/')
		if (rel && written.has(rel)) return
		clearTimeout(timer)
		timer = setTimeout(run, 200)
	})

	return new Promise(() => {})
}
