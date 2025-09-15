import fs from 'node:fs'
import path from 'node:path'
import { compose } from './compose'
import { formatChars } from './format'
import { createAgentsMdPrefix } from './logger'
import type { AgentsMdConfig, Output } from './types'

export async function watch(
	config: AgentsMdConfig & { cwd?: string; verbose?: boolean } = {},
): Promise<never> {
	const cwd = config.cwd ?? process.cwd()
	const verbose = config.verbose ?? false

	let written = new Set<string>()
	let running = false

	const run = async () => {
		running = true
		let outputs: Output[]
		if (verbose) {
			outputs = await compose({ ...config, cwd })
		} else {
			const origLog = console.log
			const origWarn = console.warn
			try {
				console.log = () => {}
				console.warn = () => {}
				outputs = await compose({ ...config, cwd })
			} finally {
				console.log = origLog
				console.warn = origWarn
			}
		}
		written = new Set(outputs.map((o) => o.path))
		if (verbose) {
			for (const o of outputs) {
				console.log(
					`${createAgentsMdPrefix()}: ✓ Updated ${o.path} (${formatChars(o.chars)} chars)`,
				)
			}
		}
		running = false
	}

	await run()
	if (verbose)
		console.log(`${createAgentsMdPrefix()}: 👀 Watching for changes...`)
	let timer: NodeJS.Timeout | undefined
	fs.watch(cwd, { recursive: true }, (_e, file) => {
		if (!file || running) return
		const rel = file.split(path.sep).join('/')
		if (written.has(rel)) return
		clearTimeout(timer)
		timer = setTimeout(run, 200)
	})

	return new Promise(() => {})
}
