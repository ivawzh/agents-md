import { expect, test } from 'bun:test'
import { parseDirectives, stripDirectiveComments } from '../src/core/directives'

test('parse directives', () => {
	const md =
		'<!-- agents-md: target=../docs, import=@./a.md, import=@./b.md, weight=5, title="My Section" -->\nContent'
	const d = parseDirectives(md)
	expect(d.target).toBe('../docs')
	expect(d.imports).toEqual(['@./a.md', '@./b.md'])
	expect(d.weight).toBe(5)
	expect(d.title).toBe('My Section')
	expect(stripDirectiveComments(md)).toBe('Content')
})
