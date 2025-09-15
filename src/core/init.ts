import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { compose } from './compose'
import type { AgentsMdConfig, Output } from './types'

export async function init(
	config: AgentsMdConfig & { cwd?: string } = {},
): Promise<Output[]> {
	const cwd = config.cwd ?? process.cwd()
	const project = 'project'
	const fragment = path.join(cwd, `${project}.agents.md`)

	const claude = path.join(cwd, 'CLAUDE.md')
	const rootAgents = path.join(cwd, 'AGENTS.md')

	if (existsSync(claude) && !existsSync(fragment)) {
		await fs.rename(claude, fragment)
		await fs.writeFile(claude, '@AGENTS.md\n')
		console.log(`moved CLAUDE.md -> ${project}.agents.md`)
	} else if (existsSync(rootAgents) && !existsSync(fragment)) {
		const content = await fs.readFile(rootAgents, 'utf8')
		await fs.writeFile(fragment, content)
		await fs.unlink(rootAgents)
		console.log(`moved AGENTS.md -> ${project}.agents.md`)
	}

	const configPath = path.join(cwd, 'agents-md.config.ts')
	if (!existsSync(configPath)) {
		const body =
			"import type { AgentsMdConfig } from 'agents-md'\nexport default { include: ['**/agents-md/**/*.md', '**/*.agents.md'] } satisfies AgentsMdConfig\n"
		await fs.writeFile(configPath, body)
		console.log('created agents-md.config.ts')
	}

	return compose({ ...config, cwd })
}
