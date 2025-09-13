import type { JsonReport, Output } from './types'

export function summarize(outputs: Output[]): JsonReport {
	const totals = { outputs: outputs.length, chars: 0, sources: 0 }
	for (const o of outputs) {
		totals.chars += o.chars
		totals.sources += o.sources.length
	}
	return { outputs, totals }
}
