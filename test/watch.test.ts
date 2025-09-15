import { expect, test } from 'bun:test'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function runWatch(cwd: string, args: string[] = []) {
	const bin = path.resolve(__dirname, '../src/cli/index.ts')
	return spawn(process.execPath, [bin, 'watch', ...args], {
		cwd,
		stdio: 'pipe',
	})
}

test('watch is silent by default', async () => {
	const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-md-watch-'))
	await fs.writeFile(
		path.join(tmp, 'a.agents.md'),
		'<!-- agents-md: import=@missing.md -->A',
	)
	const proc = runWatch(tmp)
	let out = ''
	proc.stdout.on('data', (d) => {
		out += d.toString()
	})
	proc.stderr.on('data', (d) => {
		out += d.toString()
	})
	await new Promise((r) => setTimeout(r, 1000))
	proc.kill()
	await new Promise((r) => proc.on('exit', r))
	expect(out).toBe('')
})

test('watch verbose logs once for missing imports and outputs', async () => {
	const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-md-watch-'))
	await fs.writeFile(
		path.join(tmp, 'a.agents.md'),
		'<!-- agents-md: import=@missing.md -->A',
	)
	const proc = runWatch(tmp, ['--verbose'])
	let out = ''
	proc.stdout.on('data', (d) => {
		out += d.toString()
	})
	proc.stderr.on('data', (d) => {
		out += d.toString()
	})
	await new Promise((r) => setTimeout(r, 1000))
	proc.kill()
	await new Promise((r) => proc.on('exit', r))
	const missing = out.match(/Missing import/g) ?? []
	const wrote = out.match(/Updated AGENTS.md/g) ?? []
	expect(missing.length).toBe(1)
	expect(wrote.length).toBe(1)
})
