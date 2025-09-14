export function formatChars(chars: number): string {
	return `${(chars / 1000).toFixed(1)}k`
}
