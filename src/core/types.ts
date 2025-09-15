export type TargetSelector = 'nearest' | 'root' | { path: string }

export interface AgentsMdConfig {
	include?: string[]
	exclude?: string[]
	includeFiles?: (ctx: { path: string; cwd: string }) => boolean
	defaultTarget?: 'nearest' | 'root'
	annotateSources?: boolean
	truncate?: { atChars: number; strategy?: 'end' | 'middle' }
	limits?: {
		warnSourceChars?: number
		maxSourceChars?: number
		warnOutputChars?: number
		maxOutputChars?: number
	}
}

export interface Fragment {
	path: string
	content: string
	directives: Directive
}

export interface Directive {
	target?: string
	imports?: { path: string; line: number }[]
	weight?: number
	title?: string
}

export interface Output {
	path: string
	chars: number
	sources: { path: string; chars: number }[]
}

export interface JsonReport {
	outputs: Output[]
	totals: { outputs: number; chars: number; sources: number }
	limits?: { violated: boolean; details: string[] }
}
