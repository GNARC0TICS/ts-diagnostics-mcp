# GitHub Setup and Publishing Guide

Complete guide to publishing `ts-diagnostics-mcp` to GitHub and npm.

## Prerequisites

- GitHub account
- npm account (create at npmjs.com)
- Git installed locally
- Node.js 18+ installed

## Step 1: Update Package Metadata

Before publishing, update `package.json`:

```json
{
  "name": "ts-diagnostics-mcp",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/ts-diagnostics-mcp.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/ts-diagnostics-mcp/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/ts-diagnostics-mcp#readme"
}
```

Replace `YOUR_USERNAME` with your GitHub username.

Also update `CONTRIBUTING.md`:
- Line 18: Replace `yourusername` with your GitHub username

Also update `CHANGELOG.md`:
- Line 106: Replace `yourusername` with your GitHub username

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
cd /home/developer/Degentalk-BETA/ts-diagnostics-mcp

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: TypeScript Diagnostics MCP server

- Live TypeScript diagnostics via MCP
- Monorepo support (pnpm, yarn, npm, Rush, Lerna)
- Intelligent caching with LRU cache
- 80-95% faster than running tsc repeatedly
- Zero configuration - auto-detects project structure"

# Create GitHub repository and push
gh repo create ts-diagnostics-mcp --public --source=. --description="TypeScript diagnostics MCP server - live type checking without constant recompilation" --push
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `ts-diagnostics-mcp`
3. Description: `TypeScript diagnostics MCP server - live type checking without constant recompilation`
4. Public repository
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

Then push:

```bash
cd /home/developer/Degentalk-BETA/ts-diagnostics-mcp

git init
git add .
git commit -m "Initial commit: TypeScript Diagnostics MCP server"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ts-diagnostics-mcp.git
git push -u origin main
```

## Step 3: Verify Build

Before publishing to npm, ensure everything builds correctly:

```bash
# Clean build
npm run clean
npm run build

# Verify output
ls -la dist/

# Test locally
node dist/index.js /home/developer/Degentalk-BETA
# Press Ctrl+C after confirming it starts without errors
```

## Step 4: Publish to npm

```bash
# Login to npm (first time only)
npm login

# Verify package contents
npm pack --dry-run

# This shows what will be published. Verify:
# ✓ dist/ folder is included
# ✓ README.md is included
# ✓ LICENSE is included
# ✓ CHANGELOG.md is included
# ✓ CONTRIBUTING.md is included
# ✓ .ts-diagnostics.example.json is included
# ✗ src/ folder is NOT included (excluded by .npmignore)
# ✗ PUBLISHING.md is NOT included (excluded by .npmignore)

# Publish to npm
npm publish
```

## Step 5: Create GitHub Release

```bash
# Create a git tag
git tag -a v0.1.0 -m "Release v0.1.0: Initial release"
git push origin v0.1.0
```

Then on GitHub:
1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Choose tag: `v0.1.0`
4. Release title: `v0.1.0 - Initial Release`
5. Description: Copy from CHANGELOG.md (the 0.1.0 section)
6. Click "Publish release"

## Step 6: Verify Installation

Test that users can install and use your package:

```bash
# Test npx execution
npx ts-diagnostics-mcp@latest /path/to/test/project

# Test in Claude Desktop config
# Add to claude_desktop_config.json:
{
  "mcpServers": {
    "ts-diagnostics": {
      "command": "npx",
      "args": [
        "-y",
        "ts-diagnostics-mcp@latest",
        "/absolute/path/to/your/project"
      ]
    }
  }
}
```

## Step 7: Add GitHub Repository Topics

On GitHub, add these topics to help users discover your package:
1. Go to your repository
2. Click the gear icon next to "About"
3. Add topics:
   - `mcp-server`
   - `model-context-protocol`
   - `typescript`
   - `diagnostics`
   - `monorepo`
   - `claude`
   - `ai-tools`
   - `llm`
   - `type-checking`

## Step 8: Share Your Work!

- Tweet about it (tag @anthropic if using Claude)
- Post on Reddit (r/typescript, r/programming)
- Share on Hacker News
- Add to awesome-mcp lists
- Write a blog post about the problem it solves

## Updating After Changes

When you make changes:

```bash
# Update version in package.json (use semantic versioning)
# 0.1.0 → 0.1.1 (patch: bug fixes)
# 0.1.0 → 0.2.0 (minor: new features)
# 0.1.0 → 1.0.0 (major: breaking changes)

# Update CHANGELOG.md with changes

# Commit changes
git add .
git commit -m "Description of changes"
git push

# Create new tag
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1

# Publish to npm
npm publish
```

## Troubleshooting

### "Package name already taken"

If `ts-diagnostics-mcp` is taken, use a scoped package:

```json
{
  "name": "@your-username/ts-diagnostics-mcp"
}
```

### "403 Forbidden"

Make sure you're logged in:
```bash
npm whoami
# If not logged in:
npm login
```

### Build Errors

```bash
# Clean everything and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

## Support

After publishing:
- Monitor GitHub issues
- Respond to bug reports
- Accept pull requests
- Keep dependencies updated
- Maintain CHANGELOG.md

Good luck with your open-source project! 🚀
