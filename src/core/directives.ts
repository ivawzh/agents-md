import type { Directive } from './types'

const COMMENT_RE_SINGLE = /<!--\s*agents-md:\s*([^>]*)-->/
const COMMENT_RE_GLOBAL = /<!--\s*agents-md:\s*[^>]*-->/g
const PAIR_RE = /(\w+)\s*=\s*("[^"]*"|[^,\s]+)/g

export function parseDirectives(markdown: string): Directive {
	const directive: Directive = {}
	const match = markdown.match(COMMENT_RE_SINGLE)
	if (!match) return directive
	const body = match[1]
	for (const pair of body.matchAll(PAIR_RE)) {
		const key = pair[1]
		let value = pair[2]
		if (value.startsWith('"') && value.endsWith('"')) {
			value = value.slice(1, -1)
		}
		switch (key) {
			case 'target':
				directive.target = value
				break
			case 'import':
				directive.imports ??= []
				directive.imports.push(...value.split(',').map((s) => s.trim()))
				break
			case 'weight':
				directive.weight = Number.parseInt(value, 10)
				break
			case 'title':
				directive.title = value
				break
		}
	}
	return directive
}

export function stripDirectiveComments(markdown: string): string {
	return markdown.replace(COMMENT_RE_GLOBAL, '').trim()
}
