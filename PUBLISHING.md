# Publishing Guide

Step-by-step guide to publish `ts-diagnostics-mcp` to npm and GitHub.

## Pre-Publishing Checklist

- [ ] All tests pass
- [ ] TypeScript builds without errors
- [ ] README is complete and accurate
- [ ] LICENSE file exists
- [ ] package.json has correct metadata
- [ ] Git repository is clean
- [ ] Version number is updated

---

## First-Time Setup

### 1. Create npm Account

```bash
# Create account at npmjs.com, then login
npm login
```

### 2. Initialize Git Repository

```bash
cd ts-diagnostics-mcp
git init
git add .
git commit -m "Initial commit"
```

### 3. Create GitHub Repository

```bash
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/ts-diagnostics-mcp.git
git branch -M main
git push -u origin main
```

---

## Publishing Workflow

### Step 1: Prepare for Release

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Clean and build
npm run clean
npm run build

# Verify build
npm run typecheck
ls -la dist/  # Should contain compiled .js and .d.ts files
```

### Step 2: Update Version

Use semantic versioning (MAJOR.MINOR.PATCH):

- **PATCH** (0.1.0 → 0.1.1): Bug fixes, minor improvements
- **MINOR** (0.1.0 → 0.2.0): New features, backward compatible
- **MAJOR** (0.1.0 → 1.0.0): Breaking changes

```bash
# Bump version automatically
npm version patch  # or minor, or major

# This updates package.json and creates a git tag
```

### Step 3: Test Package Locally

```bash
# Create tarball
npm pack

# This creates ts-diagnostics-mcp-0.1.0.tgz
# Test it:
npx ./ts-diagnostics-mcp-0.1.0.tgz /path/to/test/project
```

### Step 4: Publish to npm

```bash
# Dry run (see what will be published)
npm publish --dry-run

# Check the file list - should include:
# - dist/
# - README.md
# - LICENSE
# - .ts-diagnostics.example.json

# Publish for real
npm publish

# For scoped package (if you change name to @username/ts-diagnostics-mcp):
npm publish --access public
```

### Step 5: Push to GitHub

```bash
# Push code and tags
git push origin main
git push origin --tags
```

### Step 6: Create GitHub Release

1. Go to https://github.com/yourusername/ts-diagnostics-mcp/releases
2. Click "Create a new release"
3. Select the tag (e.g., v0.1.0)
4. Title: "v0.1.0 - Initial Release"
5. Description: Copy from CHANGELOG or write summary
6. Click "Publish release"

---

## Version Management

### Semantic Versioning Examples

**0.1.0 → 0.1.1** (Patch)
```bash
npm version patch -m "Fix: Cache invalidation bug"
git push && git push --tags
npm publish
```

**0.1.1 → 0.2.0** (Minor)
```bash
npm version minor -m "Feature: Add support for Turborepo"
git push && git push --tags
npm publish
```

**0.9.0 → 1.0.0** (Major)
```bash
npm version major -m "Breaking: Require Node.js 20+"
git push && git push --tags
npm publish
```

### Pre-release Versions

For beta releases:

```bash
npm version prerelease --preid=beta
# 0.1.0 → 0.1.1-beta.0

npm publish --tag beta

# Users install with:
# npx ts-diagnostics-mcp@beta
```

---

## Changelog Management

Create `CHANGELOG.md`:

```markdown
# Changelog

## [0.2.0] - 2025-10-24

### Added
- Turborepo monorepo support
- Cache statistics tool
- Environment variable configuration

### Fixed
- Memory leak in watch manager
- Incorrect package detection in Yarn v2+

### Changed
- Improved error messages
- Updated MCP SDK to v0.6.0

## [0.1.0] - 2025-10-23

### Added
- Initial release
- TypeScript diagnostics via MCP
- Monorepo support (pnpm, Yarn, npm, Rush, Lerna)
- LRU caching
- Watch mode with incremental compilation
```

---

## Package Naming Strategy

### Option 1: Unscoped (Current)

```json
{
  "name": "ts-diagnostics-mcp"
}
```

**Pros:**
- Shorter, easier to type
- No npm org required
- More discoverable

**Cons:**
- Name must be globally unique
- Can't publish multiple related packages easily

**Install:**
```bash
npx ts-diagnostics-mcp@latest
```

### Option 2: Scoped

```json
{
  "name": "@yourusername/ts-diagnostics-mcp"
}
```

**Pros:**
- Guaranteed unique namespace
- Can publish related packages (@yourusername/other-mcp)
- Professional appearance

**Cons:**
- Longer name
- Requires `--access public` flag

**Install:**
```bash
npx @yourusername/ts-diagnostics-mcp@latest
```

**Recommendation:** Start with unscoped. If name collision occurs or you plan multiple MCPs, switch to scoped.

---

## npm Package Visibility

### Public Package (Recommended)

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

Anyone can install via npm/npx.

### Private Package

```json
{
  "publishConfig": {
    "access": "restricted"
  }
}
```

Only accessible to your npm org (requires paid npm account).

---

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Setup:**
1. Create npm access token (npmjs.com → Access Tokens)
2. Add to GitHub Secrets as `NPM_TOKEN`
3. Push a tag to trigger workflow

---

## Distribution Checklist

Before publishing:

### Required Files
- [ ] `README.md` - Complete usage documentation
- [ ] `LICENSE` - MIT or your chosen license
- [ ] `package.json` - Proper metadata
- [ ] `CHANGELOG.md` - Version history

### Optional but Recommended
- [ ] `INSTALLATION.md` - Detailed setup guide
- [ ] `CONTRIBUTING.md` - Contribution guidelines
- [ ] `.ts-diagnostics.example.json` - Example config
- [ ] `.npmignore` or use `files` in package.json

### package.json Verification
- [ ] Correct `name` and `version`
- [ ] Valid `repository` URL
- [ ] Proper `bin` entry pointing to `dist/index.js`
- [ ] Shebang in `dist/index.js` (`#!/usr/bin/env node`)
- [ ] Keywords for npm search
- [ ] `engines.node` specifies minimum version
- [ ] `files` array includes only necessary files

---

## Post-Publishing

### Verify Installation

```bash
# Test global install
npm install -g ts-diagnostics-mcp
ts-diagnostics-mcp --version

# Test npx
npx ts-diagnostics-mcp@latest /path/to/project
```

### Update Documentation

- [ ] Update README with correct npm install commands
- [ ] Add shields.io badges (version, downloads, license)
- [ ] Update repository links in all docs

### Announce

- Post on:
  - Twitter/X
  - Reddit (r/typescript, r/programming)
  - Hacker News
  - Model Context Protocol Discord
  - TypeScript Discord

### Monitor

- Watch GitHub issues
- Check npm download stats
- Review bug reports

---

## Unpublishing (Emergency)

**Within 72 hours of publishing:**

```bash
npm unpublish ts-diagnostics-mcp@0.1.0
```

**After 72 hours:**

You can only deprecate:

```bash
npm deprecate ts-diagnostics-mcp@0.1.0 "Critical bug - use 0.1.1+"
```

**Best practice:** Never unpublish. Always publish a patch version with fixes.

---

## Common Publishing Mistakes

### 1. Forgetting to Build

```bash
# Always run before publishing
npm run build
```

### 2. Missing Shebang

Ensure `dist/index.js` starts with:
```javascript
#!/usr/bin/env node
```

### 3. Wrong File Permissions

```bash
# Make bin executable
chmod +x dist/index.js
```

### 4. Including Test Files

Use `.npmignore` or `files` array to exclude:
- `src/` (unless needed)
- `tests/`
- `.env`
- `*.log`
- `.github/`

### 5. Hardcoded Paths

Never hardcode absolute paths in published code.

---

## Maintenance Workflow

### Regular Updates

```bash
# Update dependencies
npm update
npm outdated  # Check for major updates

# Test
npm run build
npm run typecheck

# Publish patch
npm version patch
git push && git push --tags
npm publish
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Publish security patch
npm version patch -m "Security: Update dependencies"
git push && git push --tags
npm publish
```

---

## Success Metrics

Track on npm:
- Weekly downloads
- Dependent packages
- GitHub stars
- Issue resolution time

**Good signs:**
- Growing download count
- Community contributions
- Other packages depending on yours
- Low open issue count

---

## Support

Once published, provide support via:
- GitHub Issues (bug reports)
- GitHub Discussions (questions, ideas)
- Discord/Slack (real-time help)
- Email (critical security issues)
