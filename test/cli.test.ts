import { expect, test } from 'bun:test'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function runCli(cwd: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const bin = path.resolve(__dirname, '../src/cli/index.ts')
		const proc = spawn('bun', [bin, ...args], { cwd, stdio: 'pipe' })
		let out = ''
		proc.stdout.on('data', (d) => {
			out += d.toString()
		})
		proc.stderr.on('data', (d) => {
			out += d.toString()
		})
		proc.on('exit', (code) => {
			if (code === 0) resolve(out.trim())
			else reject(new Error(`exit ${code}: ${out}`))
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

test('cli init scaffolds config and migrates AGENTS.md', async () => {
	const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-md-init-'))
	await fs.writeFile(path.join(tmp, 'AGENTS.md'), 'Legacy')
	const output = await runCli(tmp, ['init'])
	const fragment = await fs.readFile(
		path.join(tmp, 'project.agents.md'),
		'utf8',
	)
	expect(fragment).toContain('Legacy')
	const config = await fs.readFile(
		path.join(tmp, 'agents-md.config.ts'),
		'utf8',
	)
	expect(config).toContain(
		"include: ['**/agents-md/**/*.md', '**/*.agents.md']",
	)
	const generated = await fs.readFile(path.join(tmp, 'AGENTS.md'), 'utf8')
	expect(generated).toContain('Legacy')
	expect(output).toMatch(/created agents-md.config.ts/)
})

test('cli report outputs json', async () => {
	const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-md-report-'))
	await fs.writeFile(path.join(tmp, 'a.agents.md'), 'A')
	const out = await runCli(tmp, ['report', '--json'])
	const data = JSON.parse(out)
	expect(data.outputs[0].path).toBe('AGENTS.md')
	expect(data.outputs[0].chars).toBeGreaterThan(0)
	expect(data.totals.chars).toBeGreaterThan(0)
})

test('cli report prints friendly output', async () => {
	const tmp = await fs.mkdtemp(
		path.join(os.tmpdir(), 'agents-md-report-human-'),
	)
	await fs.writeFile(path.join(tmp, 'a.agents.md'), 'A')
	const out = await runCli(tmp, ['report'])
	expect(out).toContain('AGENTS.md (root) -')
	expect(out).toMatch(/k chars/)
	expect(out).toContain('Totals: 1 AGENTS.md files')
})
