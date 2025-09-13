export type TargetSelector = 'nearest' | 'root' | { path: string }

export interface AgentsMdConfig {
	include?: string[]
	exclude?: string[]
	includeFiles?: (ctx: { path: string; cwd: string }) => boolean
	defaultTarget?: 'nearest' | 'root'
	annotateSources?: boolean
}

export interface Fragment {
	path: string
	content: string
	directives: Directive
}

export interface Directive {
	target?: string
	imports?: string[]
	weight?: number
	title?: string
}

export interface Output {
	path: string
	bytes: number
	sources: { path: string; bytes: number }[]
}
