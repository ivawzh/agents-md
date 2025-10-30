# Testing agents-md Locally

This guide shows how to test the package locally before publishing.

## Method 1: npm link (Recommended)

This creates a global symlink to your local package so you can test it like it's installed.

### Setup

```bash
# In the agents-md repo
bun run build
npm link

# Verify it's linked
which agents-md
# Should show: /usr/local/bin/agents-md or similar
```

### Test in Different Projects

#### Test 1: Node.js Project with package.json

```bash
cd /tmp
mkdir test-nodejs-project
cd test-nodejs-project
git init
npm init -y

# Create some fragment files
mkdir -p docs
echo "# API Documentation" > docs/api.agents.md
echo "# User Guide" > docs/guide.agents.md

# Test setup command
agents-md setup:compose-before-commit

# Verify hook was created
cat .git/hooks/pre-commit

# Test compose command
agents-md compose

# Check output
cat AGENTS.md

# Test the actual git hook
git add .
git commit -m "test commit"
# Should auto-run agents-md compose and stage AGENTS.md
```

#### Test 2: Python Project (No package.json)

```bash
cd /tmp
mkdir test-python-project
cd test-python-project
git init

# Create Python files and fragments
echo "print('Hello')" > main.py
echo "# Python API Docs" > api.agents.md

# Test setup command
agents-md setup:compose-before-commit

# Verify hook
cat .git/hooks/pre-commit

# Test compose
agents-md compose
cat AGENTS.md

# Test commit
git add .
git commit -m "test commit"
```

#### Test 3: Existing pre-commit Hook

```bash
cd /tmp
mkdir test-existing-hook
cd test-existing-hook
git init

# Create existing hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "Running existing tests..."
npm test
EOF
chmod +x .git/hooks/pre-commit

# Try to setup - should warn about existing hook
agents-md setup:compose-before-commit
# Expected: Error message about existing hook
```

#### Test 4: Global Installation Performance

```bash
cd /tmp
mkdir test-global-perf
cd test-global-perf
git init
echo "# Test" > test.agents.md

# Setup hook
agents-md setup:compose-before-commit

# Time the compose command
time agents-md compose
# Should be fast since it's using the linked version
```

### Cleanup After Testing

```bash
# Remove the global link
npm unlink -g agents-md

# Clean up test directories
rm -rf /tmp/test-*
```

## Method 2: Direct npx with Local Path

You can also test using npx with the local path:

```bash
cd /tmp/some-test-project
git init

# Use npx with local path
npx /home/iw/repos/agents-md setup:compose-before-commit
npx /home/iw/repos/agents-md compose
```

## Method 3: Pack and Install

Test the actual package that would be published:

```bash
# In agents-md repo
bun run build
npm pack
# Creates: agents-md-1.0.0.tgz

# In test project
cd /tmp/test-pack
npm init -y
npm install /home/iw/repos/agents-md/agents-md-1.0.0.tgz

# Test it
npx agents-md setup:compose-before-commit
npx agents-md compose
```

## Test Checklist

Before publishing, verify:

- [ ] `agents-md init` works
- [ ] `agents-md compose` generates AGENTS.md correctly
- [ ] `agents-md report` shows output stats
- [ ] `agents-md watch` monitors file changes
- [ ] `agents-md setup:compose-before-commit` creates hook
- [ ] Hook works in Node.js project
- [ ] Hook works in non-Node.js project
- [ ] Hook actually runs on `git commit`
- [ ] Hook can be bypassed with `--no-verify`
- [ ] Warning shown when hook already exists
- [ ] All commands show proper error messages
- [ ] TypeScript types are correct
- [ ] CLI help text is accurate

## Common Issues

### "Permission denied" when running agents-md

```bash
chmod +x dist/cli/index.js
# Or rebuild: bun run build
```

### npx keeps downloading from npm instead of using local

Make sure you've run `npm link` and it's properly linked:
```bash
npm link
which agents-md  # Should show local path
```

### Hook doesn't execute

Check permissions:
```bash
ls -la .git/hooks/pre-commit
# Should be: -rwxr-xr-x
```

## Automated Testing Script

You can run all tests at once:

```bash
# Create automated test script
cat > /tmp/test-agents-md.sh << 'EOF'
#!/bin/bash
set -e

echo "🧪 Testing agents-md locally..."

# Test Node.js project
echo "📦 Testing Node.js project..."
cd /tmp
rm -rf test-node
mkdir test-node && cd test-node
git init
npm init -y
echo "# Docs" > test.agents.md
agents-md setup:compose-before-commit
agents-md compose
test -f AGENTS.md && echo "✅ Node.js project: PASS" || echo "❌ Node.js project: FAIL"

# Test Python project
echo "🐍 Testing Python project..."
cd /tmp
rm -rf test-python
mkdir test-python && cd test-python
git init
echo "# API" > api.agents.md
agents-md setup:compose-before-commit
agents-md compose
test -f AGENTS.md && echo "✅ Python project: PASS" || echo "❌ Python project: FAIL"

# Test hook execution
echo "🪝 Testing hook execution..."
cd /tmp/test-node
git add .
git commit -m "test" --no-verify  # First commit without hook
echo "# Update" >> test.agents.md
git add test.agents.md
git commit -m "test with hook" && echo "✅ Hook execution: PASS" || echo "❌ Hook execution: FAIL"

echo "✨ All tests complete!"
EOF

chmod +x /tmp/test-agents-md.sh
/tmp/test-agents-md.sh
```
