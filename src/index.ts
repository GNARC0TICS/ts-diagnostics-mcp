#!/usr/bin/env node

/**
 * TypeScript Diagnostics MCP Server
 * Main entry point
 */

import { TypeScriptWatchManager } from './core/watch-manager.js';
import { TypeScriptDiagnosticsMCPServer } from './mcp/server.js';
import { loadConfig, normalizeTsConfigs, validateConfig } from './utils/config.js';

/**
 * Main function
 */
async function main() {
  try {
    // Get project root from args or environment
    const projectRoot = process.argv[2] || process.env.PROJECT_ROOT || process.cwd();

    console.error(`Starting TypeScript Diagnostics MCP for project: ${projectRoot}`);

    // Load configuration
    const config = await loadConfig(projectRoot);
    validateConfig(config);

    // Normalize configs to array
    const tsConfigs = normalizeTsConfigs(config.tsConfigs);

    console.error(`Watching ${tsConfigs.length} TypeScript config(s):`);
    for (const cfg of tsConfigs) {
      console.error(`  - ${cfg.name || 'unknown'}: ${cfg.configPath}`);
    }

    // Log ignore patterns
    if (config.ignorePatterns && config.ignorePatterns.length > 0) {
      console.error(`Ignoring ${config.ignorePatterns.length} pattern(s)`);
    }

    // Create watch manager
    const watchManager = new TypeScriptWatchManager(
      tsConfigs,
      config.maxCacheSize,
      config.ignorePatterns || []
    );

    // Start watching
    watchManager.start();

    // Create and start MCP server
    const mcpServer = new TypeScriptDiagnosticsMCPServer(watchManager);
    await mcpServer.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('\nShutting down...');
      watchManager.stop();
      await mcpServer.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('\nShutting down...');
      watchManager.stop();
      await mcpServer.stop();
      process.exit(0);
    });

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
