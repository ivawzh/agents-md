import { expect, test } from 'bun:test'
import { summarize } from '../src/core/report'
import type { Output } from '../src/core/types'

test('summarize computes totals', () => {
	const outputs: Output[] = [
		{
			path: 'AGENTS.md',
			chars: 10,
			sources: [{ path: 'a.agents.md', chars: 5 }],
		},
	]
	const summary = summarize(outputs, {})
	expect(summary.totals).toEqual({ outputs: 1, chars: 10, sources: 1 })
})

test('summarize reports limits', () => {
	const outputs: Output[] = [
		{
			path: 'AGENTS.md',
			chars: 120,
			sources: [{ path: 'a.agents.md', chars: 80 }],
		},
	]
	const summary = summarize(outputs, {
		limits: { warnOutputChars: 100, maxSourceChars: 70 },
	})
	expect(summary.limits).toBeDefined()
	expect(
		summary.limits?.details.some((d) => d.includes('AGENTS.md exceeds warn')),
	).toBe(true)
	expect(
		summary.limits?.details.some((d) => d.includes('a.agents.md exceeds max')),
	).toBe(true)
	expect(summary.limits?.violated).toBe(true)
})
