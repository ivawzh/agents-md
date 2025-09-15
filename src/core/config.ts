import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { AgentsMdConfig } from './types'

export async function loadConfig(cwd: string): Promise<AgentsMdConfig> {
	const names = [
		'agents-md.config.ts',
		'agents-md.config.mjs',
		'agents-md.config.js',
	]
	for (const name of names) {
		const full = path.join(cwd, name)
		if (existsSync(full)) {
			const mod = await import(pathToFileURL(full).href)
			return (
				(mod as { default?: AgentsMdConfig }).default ?? (mod as AgentsMdConfig)
			)
		}
	}
	return {}
}
