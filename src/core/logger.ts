/**
 * Creates a clickable terminal link for agents-md with GitHub URL
 * Falls back to plain text in terminals that don't support links
 */
export function createAgentsMdPrefix(): string {
	// OSC 8 hyperlink format: \u001b]8;;URL\u0007TEXT\u001b]8;;\u0007
	const url = 'https://github.com/ivawzh/agents-md'
	const text = 'agents-md'

	// Check if we're in a terminal that likely supports hyperlinks
	const supportsLinks =
		process.stdout.isTTY &&
		(process.env.TERM_PROGRAM === 'iTerm.app' ||
			process.env.TERM_PROGRAM === 'vscode' ||
			process.env.WT_SESSION || // Windows Terminal
			process.env.TERM?.includes('xterm'))

	if (supportsLinks) {
		return `[\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007]`
	}

	return `[${text}]`
}
