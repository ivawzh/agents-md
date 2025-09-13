import fg from 'fast-glob'
import type { AgentsMdConfig } from './types'

export async function discover(
	cwd: string,
	config: AgentsMdConfig,
): Promise<string[]> {
	const include = config.include ?? ['**/agents-md/**/*.md', '**/*.agents.md']
	const exclude = config.exclude ?? ['**/node_modules/**', '**/.git/**']
	const paths = await fg(include, { cwd, ignore: exclude, dot: true })
	return paths.filter((p) =>
		config.includeFiles ? config.includeFiles({ path: p, cwd }) : true,
	)
}
