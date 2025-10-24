# Pre-Flight Checklist

Complete this checklist before publishing to GitHub and npm.

## ✅ Code Quality

- [x] Build completes without errors (`npm run build`)
- [x] TypeScript compiles without warnings
- [x] All source files properly formatted
- [x] No console.log statements (except intended diagnostics to stderr)
- [x] Proper error handling implemented

## ✅ Package Configuration

- [ ] **REQUIRED:** Update `package.json` author field
  - Current: `"author": "Your Name <your.email@example.com>"`
  - Change to: `"author": "Your Actual Name <your.real@email.com>"`

- [ ] **REQUIRED:** Update `package.json` repository URLs (3 places)
  - Line 39: `"url": "https://github.com/YOUR_USERNAME/ts-diagnostics-mcp.git"`
  - Line 42: `"url": "https://github.com/YOUR_USERNAME/ts-diagnostics-mcp/issues"`
  - Line 44: `"homepage": "https://github.com/YOUR_USERNAME/ts-diagnostics-mcp#readme"`
  - Replace `YOUR_USERNAME` with your GitHub username

- [x] Package name is available on npm (check at npmjs.com/package/ts-diagnostics-mcp)
- [x] Version is set to 0.1.0 for initial release
- [x] License is MIT
- [x] Bin entry points to correct file

## ✅ Documentation

- [ ] **REQUIRED:** Update `CONTRIBUTING.md` line 18
  - Change: `git clone https://github.com/yourusername/ts-diagnostics-mcp.git`
  - To: `git clone https://github.com/YOUR_USERNAME/ts-diagnostics-mcp.git`

- [ ] **REQUIRED:** Update `CHANGELOG.md` line 106
  - Change: `[0.1.0]: https://github.com/yourusername/ts-diagnostics-mcp/releases/tag/v0.1.0`
  - To: `[0.1.0]: https://github.com/YOUR_USERNAME/ts-diagnostics-mcp/releases/tag/v0.1.0`

- [x] README.md is comprehensive and clear
- [x] Installation instructions are correct
- [x] Usage examples are included
- [x] LICENSE file is present (MIT)
- [x] CHANGELOG.md documents v0.1.0
- [x] CONTRIBUTING.md has development setup
- [x] Example configuration file included

## ✅ npm Package

- [x] `.npmignore` properly configured
  - ✓ Excludes `src/` (source files)
  - ✓ Excludes `PUBLISHING.md` (internal docs)
  - ✓ Includes `dist/` (compiled code)
  - ✓ Includes `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`

- [x] Package size is reasonable
  - Current: 22.9 KB (excellent!)
  - Unpacked: 96.9 KB (good!)

- [x] Dry run successful: `npm pack --dry-run`

## ✅ Testing

- [x] MCP server starts without errors
- [x] Auto-detects monorepos correctly
- [x] Finds all workspace packages
- [x] TypeScript watch mode activates
- [ ] Test with a different TypeScript project (optional but recommended)
- [ ] Test via npx: `npx ./ts-diagnostics-mcp@latest /test/path` (after publishing)

## ✅ Git Repository

- [ ] Git repository initialized: `git init`
- [ ] All files committed: `git add . && git commit -m "Initial commit"`
- [ ] Committed files include:
  - [x] `src/` - Source code
  - [x] `dist/` - Compiled code
  - [x] `package.json`
  - [x] `tsconfig.json`
  - [x] `.gitignore`
  - [x] `.npmignore`
  - [x] `README.md`
  - [x] `LICENSE`
  - [x] `CHANGELOG.md`
  - [x] `CONTRIBUTING.md`
  - [x] `.ts-diagnostics.example.json`
  - [x] `PUBLISHING.md`
  - [x] `GITHUB_SETUP.md`

## ✅ GitHub Setup

- [ ] GitHub repository created
  - Name: `ts-diagnostics-mcp`
  - Description: "TypeScript diagnostics MCP server - live type checking without constant recompilation"
  - Public visibility
  - No initialization (we have files already)

- [ ] Pushed to GitHub: `git push -u origin main`

- [ ] Add repository topics on GitHub:
  - `mcp-server`
  - `model-context-protocol`
  - `typescript`
  - `diagnostics`
  - `monorepo`
  - `claude`
  - `ai-tools`
  - `llm`
  - `type-checking`

## ✅ npm Publishing

- [ ] npm account created (npmjs.com)
- [ ] Logged in to npm: `npm login`
- [ ] Published to npm: `npm publish`
- [ ] Verify on npm: https://www.npmjs.com/package/ts-diagnostics-mcp

## ✅ GitHub Release

- [ ] Create git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
- [ ] Push tag: `git push origin v0.1.0`
- [ ] Create GitHub release from tag
  - Title: "v0.1.0 - Initial Release"
  - Copy description from CHANGELOG.md

## ✅ Post-Publication Verification

- [ ] Test npx installation:
  ```bash
  npx ts-diagnostics-mcp@latest /path/to/test/project
  ```

- [ ] Test Claude Desktop integration:
  ```json
  {
    "mcpServers": {
      "ts-diagnostics": {
        "command": "npx",
        "args": ["-y", "ts-diagnostics-mcp@latest", "/path/to/project"]
      }
    }
  }
  ```

- [ ] Verify package appears on npm
- [ ] Verify GitHub repository is accessible
- [ ] Check that README renders properly on GitHub

## 🎉 Ready to Share!

Once all checkboxes are complete:

- [ ] Share on Twitter/X (tag @anthropic if relevant)
- [ ] Post on Reddit (r/typescript, r/programming)
- [ ] Share on Hacker News
- [ ] Write a blog post about the problem it solves
- [ ] Add to awesome-mcp lists
- [ ] Star your own repo (you earned it!)

---

## Quick Command Reference

```bash
# Build
npm run clean && npm run build

# Verify package
npm pack --dry-run

# Git setup
git init
git add .
git commit -m "Initial commit: TypeScript Diagnostics MCP server"
git remote add origin https://github.com/YOUR_USERNAME/ts-diagnostics-mcp.git
git push -u origin main

# Tag and release
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# npm publish
npm login
npm publish

# Test
npx ts-diagnostics-mcp@latest /path/to/project
```

---

## Important Notes

1. **Replace ALL instances of `YOUR_USERNAME` with your actual GitHub username**
2. **Replace author info with your real name and email**
3. **Double-check package name availability on npm before publishing**
4. **Test locally before publishing - you can't unpublish easily!**

Good luck! 🚀
