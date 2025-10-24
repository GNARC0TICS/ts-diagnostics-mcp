/**
 * Configuration utilities
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { MCPConfig, TSProjectConfig } from '../types/index.js';
import { detectWorkspace } from './workspace.js';

/**
 * Default ignore patterns - these are always applied
 */
export const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/coverage/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/.cache/**',
  '**/out/**',
  '**/*.min.js',
  '**/*.bundle.js',
  '**/.tsbuildinfo',
];

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Partial<MCPConfig> = {
  maxCacheSize: 100,
  debounceMs: 500,
  maxConcurrentQueries: 10,
  healthCheckInterval: 30000,
  autoRestartOnCrash: true,
  fallbackToDirectTsc: true,
  enableIncrementalMode: true,
  enablePersistentCache: false,
  autoDetectWorkspaces: true,
  ignorePatterns: DEFAULT_IGNORE_PATTERNS,
};

/**
 * Load configuration from file or environment
 */
export async function loadConfig(projectRoot: string): Promise<MCPConfig> {
  // Try loading from .ts-diagnostics.json
  const configPath = join(projectRoot, '.ts-diagnostics.json');
  let fileConfig: Partial<MCPConfig> = {};

  if (existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      console.error(`Loaded config from ${configPath}`);
    } catch (error) {
      console.error(`Failed to load config from ${configPath}:`, error);
    }
  }

  // Merge with environment variables
  const envConfig: Partial<MCPConfig> = {
    maxCacheSize: process.env.TS_DIAG_MAX_CACHE_SIZE
      ? parseInt(process.env.TS_DIAG_MAX_CACHE_SIZE)
      : undefined,
    debounceMs: process.env.TS_DIAG_DEBOUNCE_MS
      ? parseInt(process.env.TS_DIAG_DEBOUNCE_MS)
      : undefined,
    enableIncrementalMode: process.env.TS_DIAG_INCREMENTAL === 'true' ? true : undefined,
    autoDetectWorkspaces: process.env.TS_DIAG_AUTO_DETECT === 'false' ? false : undefined,
  };

  // Merge all configs (env > file > defaults)
  const config: MCPConfig = {
    projectRoot,
    tsConfigs: '',
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envConfig,
  };

  // Merge ignore patterns (combine defaults with user-provided)
  if (fileConfig.ignorePatterns || envConfig.ignorePatterns) {
    const userPatterns = fileConfig.ignorePatterns || envConfig.ignorePatterns || [];
    config.ignorePatterns = [...DEFAULT_IGNORE_PATTERNS, ...userPatterns];
  }

  // Auto-detect workspaces if enabled (default is true)
  const shouldAutoDetect = config.autoDetectWorkspaces !== false;

  if (shouldAutoDetect) {
    console.error('Auto-detecting workspace...');
    const workspace = await detectWorkspace(projectRoot);

    console.error(`Workspace type: ${workspace.type}, packages: ${workspace.packages.length}`);

    if (workspace.packages.length > 0) {
      config.tsConfigs = workspace.packages;
      console.error(`Auto-detected ${workspace.type} workspace with ${workspace.packages.length} packages`);
    } else {
      // Fallback to root tsconfig
      const rootTsConfig = join(projectRoot, 'tsconfig.json');
      console.error(`Falling back to root tsconfig: ${rootTsConfig}`);
      config.tsConfigs = rootTsConfig;
    }
  }

  return config;
}

/**
 * Normalize tsConfigs to array
 */
export function normalizeTsConfigs(tsConfigs: TSProjectConfig[] | string): TSProjectConfig[] {
  if (typeof tsConfigs === 'string') {
    return [
      {
        configPath: tsConfigs,
        name: 'root',
        rootDir: tsConfigs.replace('/tsconfig.json', ''),
      },
    ];
  }

  return tsConfigs;
}

/**
 * Validate configuration
 */
export function validateConfig(config: MCPConfig): void {
  if (!config.projectRoot) {
    throw new Error('projectRoot is required');
  }

  if (!config.tsConfigs || (typeof config.tsConfigs === 'string' && config.tsConfigs === '')) {
    throw new Error('tsConfigs is required - no TypeScript configs found or specified');
  }

  const configs = normalizeTsConfigs(config.tsConfigs);

  if (configs.length === 0) {
    throw new Error('No valid TypeScript configs found');
  }

  for (const tsConfig of configs) {
    if (!existsSync(tsConfig.configPath)) {
      throw new Error(`tsconfig not found: ${tsConfig.configPath}`);
    }
  }
}
