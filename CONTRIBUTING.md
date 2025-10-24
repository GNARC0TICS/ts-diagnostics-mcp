# Contributing to TypeScript Diagnostics MCP

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm, npm, or yarn
- TypeScript knowledge
- Familiarity with Model Context Protocol (MCP)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/GNARC0TICS/ts-diagnostics-mcp.git
cd ts-diagnostics-mcp

# Install dependencies
npm install

# Build
npm run build

# Run in development mode (watch)
npm run dev
```

### Testing Your Changes

```bash
# Build
npm run build

# Test locally with a TypeScript project
node dist/index.js /path/to/test/project

# Test via npx
npx ./ /path/to/test/project

# Type check
npm run typecheck
```

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
1. Check existing issues to avoid duplicates
2. Verify the bug exists in the latest version
3. Collect relevant information (Node.js version, OS, error logs)

**Submit a bug report:**
- Use a clear, descriptive title
- Provide steps to reproduce
- Include error messages and logs
- Describe expected vs actual behavior
- Add context (OS, Node.js version, project structure)

### Suggesting Features

**Before suggesting a feature:**
1. Check if it's already been suggested
2. Consider if it fits the project's scope
3. Think about the implementation complexity

**Submit a feature request:**
- Use a clear, descriptive title
- Explain the problem you're trying to solve
- Describe your proposed solution
- Provide examples of how it would be used
- Consider alternative solutions

### Pull Requests

**Before submitting a PR:**
1. Create an issue to discuss major changes
2. Ensure your code follows the project's style
3. Add tests if applicable
4. Update documentation

**PR Process:**

1. **Fork and create a branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes:**
   - Write clear, concise commit messages
   - Keep commits focused and atomic
   - Add comments for complex logic

3. **Test thoroughly:**
   ```bash
   npm run build
   npm run typecheck
   node dist/index.js /path/to/test/project
   ```

4. **Update documentation:**
   - Update README.md if needed
   - Add JSDoc comments to new functions
   - Update CHANGELOG.md

5. **Submit PR:**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe your changes
   - Explain why the change is needed

**PR Checklist:**
- [ ] Code builds without errors
- [ ] TypeScript types are correct
- [ ] No breaking changes (or clearly documented)
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts

## Code Style

### TypeScript Guidelines

**Naming conventions:**
```typescript
// Classes: PascalCase
class TypeScriptWatchManager { }

// Interfaces/Types: PascalCase
interface DiagnosticCache { }
type ConfigOptions = { };

// Functions: camelCase
function getDiagnostics() { }

// Constants: UPPER_SNAKE_CASE
const DEFAULT_CACHE_SIZE = 100;

// Variables: camelCase
const projectRoot = '/path/to/project';
```

**Type annotations:**
```typescript
// Always specify return types for public functions
export function getErrors(): Diagnostic[] {
  return diagnostics.filter(d => d.category === DiagnosticCategory.Error);
}

// Use interfaces for objects
interface WatchConfig {
  projectRoot: string;
  maxCacheSize: number;
}

// Avoid `any` - use `unknown` if type is truly unknown
function parseInput(input: unknown): number {
  if (typeof input === 'number') return input;
  throw new Error('Invalid input');
}
```

**Error handling:**
```typescript
// Provide helpful error messages
throw new Error(
  `No TypeScript configs found in ${projectRoot}.\n` +
  `Ensure project has tsconfig.json or workspace configuration.`
);

// Log errors to stderr (stdout is for MCP protocol)
console.error(`Error: ${error.message}`);
```

### File Organization

```
src/
├── index.ts              # Entry point
├── core/                 # Core functionality
│   ├── watch-manager.ts  # TypeScript watch logic
│   └── cache.ts          # LRU cache implementation
├── mcp/                  # MCP server
│   ├── server.ts         # MCP server setup
│   └── tools.ts          # MCP tool definitions
├── utils/                # Utilities
│   ├── config.ts         # Configuration loading
│   ├── monorepo.ts       # Monorepo detection
│   └── types.ts          # Type definitions
└── types/                # TypeScript type definitions
    └── index.d.ts
```

### Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**
```
feat(monorepo): Add Turborepo support

- Detect turborepo.json
- Parse workspace packages from turbo config
- Add tests for Turborepo detection

Closes #42

---

fix(cache): Prevent memory leak in diagnostic cache

The cache was not properly releasing references to old diagnostics,
causing memory to grow unbounded in long-running watch sessions.

- Add TTL to cache entries
- Implement periodic cleanup
- Add cache size monitoring

Fixes #38

---

docs(readme): Update installation instructions

- Add Claude Desktop configuration examples
- Clarify monorepo setup
- Add troubleshooting section
```

## Development Workflow

### Adding a New Feature

1. **Create an issue** describing the feature
2. **Discuss** implementation approach
3. **Create a branch** from main
4. **Implement** the feature
5. **Test** thoroughly
6. **Document** in README and code comments
7. **Submit PR** with clear description

### Fixing a Bug

1. **Create an issue** with reproduction steps
2. **Write a test** that reproduces the bug (if possible)
3. **Fix** the bug
4. **Verify** the test passes
5. **Submit PR** with issue reference

### Improving Documentation

Documentation PRs are always welcome! No need for an issue first.

- Fix typos
- Clarify confusing sections
- Add examples
- Improve structure

## Testing

### Manual Testing

**Test with various project types:**
```bash
# Single TypeScript project
node dist/index.js /path/to/single-project

# pnpm monorepo
node dist/index.js /path/to/pnpm-monorepo

# Yarn workspaces
node dist/index.js /path/to/yarn-workspace

# npm workspaces
node dist/index.js /path/to/npm-workspace
```

**Test MCP integration:**
1. Build the project
2. Configure in Claude Desktop
3. Restart Claude Desktop
4. Test each MCP tool:
   - `has_errors`
   - `get_all_diagnostics`
   - `get_diagnostic_count`
   - `list_packages`
   - etc.

### Automated Tests (Future)

We plan to add automated tests. Contributions in this area are especially welcome!

**Planned test coverage:**
- Configuration loading
- Monorepo detection
- Diagnostic caching
- MCP tool responses

## Release Process

(For maintainers)

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Publishing

```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Update version
npm version patch  # or minor, or major

# This triggers prepublishOnly script:
# - Cleans dist/
# - Builds TypeScript
# - Runs typecheck

# Publish to npm
npm publish

# Push tags
git push origin main --tags

# Create GitHub release
gh release create v0.1.1 --notes "Bug fixes and improvements"
```

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy toward others

### Unacceptable Behavior

- Harassment or discriminatory comments
- Trolling or insulting remarks
- Public or private harassment
- Publishing others' private information

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to [email@example.com]

## Questions?

- Open an issue with the "question" label
- Join our Discord (link)
- Email [email@example.com]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
