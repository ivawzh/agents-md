import type { AgentsMdConfig, JsonReport, Output } from './types'

export function summarize(
	outputs: Output[],
	config: AgentsMdConfig = {},
): JsonReport {
	const totals = { outputs: outputs.length, chars: 0, sources: 0 }
	for (const o of outputs) {
		totals.chars += o.chars
		totals.sources += o.sources.length
	}
	const details: string[] = []
	let violated = false
	const limits = config.limits
	if (limits) {
		for (const o of outputs) {
			if (limits.warnOutputChars && o.chars > limits.warnOutputChars) {
				details.push(
					`${o.path} exceeds warn output chars (${o.chars} > ${limits.warnOutputChars})`,
				)
			}
			if (limits.maxOutputChars && o.chars > limits.maxOutputChars) {
				violated = true
				details.push(
					`${o.path} exceeds max output chars (${o.chars} > ${limits.maxOutputChars})`,
				)
			}
			for (const s of o.sources) {
				if (limits.warnSourceChars && s.chars > limits.warnSourceChars) {
					details.push(
						`${s.path} exceeds warn source chars (${s.chars} > ${limits.warnSourceChars})`,
					)
				}
				if (limits.maxSourceChars && s.chars > limits.maxSourceChars) {
					violated = true
					details.push(
						`${s.path} exceeds max source chars (${s.chars} > ${limits.maxSourceChars})`,
					)
				}
			}
		}
	}
	return {
		outputs,
		totals,
		...(details.length ? { limits: { violated, details } } : {}),
	}
}
