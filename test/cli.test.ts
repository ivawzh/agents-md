import { expect, test } from 'bun:test'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function runCli(cwd: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const bin = path.resolve(__dirname, '../src/cli/index.ts')
		const proc = spawn('bun', [bin, ...args], { cwd })
		proc.on('exit', (code) => {
			if (code === 0) resolve()
			else reject(new Error(`exit ${code}`))
		})
	})
}

test('cli compose generates AGENTS.md', async () => {
	const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-md-cli-'))
	await fs.writeFile(path.join(tmp, 'a.agents.md'), 'Hello')
	await runCli(tmp, ['compose'])
	const out = await fs.readFile(path.join(tmp, 'AGENTS.md'), 'utf8')
	expect(out).toContain('Hello')
})
