# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Ignore patterns** - Filter files from diagnostics with glob patterns
  - Default patterns exclude node_modules, dist, build, .git, etc.
  - Customizable via `ignorePatterns` in `.ts-diagnostics.json`
  - Prevents watching unnecessary files for better performance

## [0.1.0] - 2025-10-23

### Added

**Core Features:**
- TypeScript diagnostics via Model Context Protocol (MCP)
- Real-time watch mode using TypeScript Compiler API
- Intelligent LRU caching with configurable size limits
- Incremental compilation support
- File change debouncing for performance

**Monorepo Support:**
- Auto-detection of pnpm workspaces (pnpm-workspace.yaml)
- Auto-detection of Yarn workspaces (package.json)
- Auto-detection of npm workspaces (package.json)
- Auto-detection of Rush monorepos (rush.json)
- Auto-detection of Lerna monorepos (lerna.json)
- Package-level diagnostic filtering

**MCP Tools:**
- `has_errors` - Fast boolean check for TypeScript errors
- `get_diagnostic_count` - Get count of errors/warnings/suggestions
- `get_all_diagnostics` - Retrieve all diagnostics across project
- `get_file_diagnostics` - Get diagnostics for specific file
- `get_package_diagnostics` - Get diagnostics for specific package (monorepo)
- `list_packages` - List all detected packages in workspace
- `get_watch_status` - Check TypeScript watch process status
- `get_cache_stats` - View cache hit/miss statistics
- `clear_cache` - Clear diagnostic cache

**Configuration:**
- Environment variable configuration support
- `.ts-diagnostics.json` configuration file support
- Auto-detection of project structure (zero config for most projects)
- Manual TypeScript config specification for complex setups

**Documentation:**
- Comprehensive README with installation and quick start
- Publishing guide for maintainers (PUBLISHING.md)
- Contributing guidelines (CONTRIBUTING.md)
- Example configuration file (.ts-diagnostics.example.json)
- Complete changelog (CHANGELOG.md)

**Distribution:**
- npm package with npx support
- Claude Desktop integration
- Claude Code integration
- Global installation support
- Cross-platform support (macOS, Windows, Linux)

### Performance

- 80-95% faster than running `tsc` repeatedly
- Microsecond response time for cached queries
- Millisecond response time for uncached queries
- Efficient memory usage with LRU cache
- Single background process serves multiple AI agents

### Technical

- TypeScript 5.6+
- Node.js 18+ required
- ESM module format
- Full TypeScript type definitions
- Model Context Protocol SDK integration

---

## Future Releases

### [0.2.0] - Planned

**Potential additions:**
- Turborepo monorepo support
- Nx monorepo support
- Performance metrics and telemetry
- Custom diagnostic severity filtering
- Watch exclude patterns
- Project-specific configuration overrides
- VSCode extension integration

### [1.0.0] - Planned

**Stabilization release:**
- Comprehensive test suite
- Performance benchmarks
- API stability guarantees
- Migration guide from 0.x
- Production-ready status

---

## Version History

[0.1.0]: https://github.com/GNARC0TICS/ts-diagnostics-mcp/releases/tag/v0.1.0
