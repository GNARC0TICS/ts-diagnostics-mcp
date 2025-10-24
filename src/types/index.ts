/**
 * Core type definitions for TypeScript Diagnostics MCP
 */

import ts from 'typescript';

/**
 * Diagnostic severity levels
 */
export type DiagnosticCategory = 'error' | 'warning' | 'suggestion' | 'message';

/**
 * Simplified diagnostic format for MCP responses
 */
export interface Diagnostic {
  file: string;
  line: number;
  column: number;
  category: DiagnosticCategory;
  code: number;
  message: string;
  messageText: string;
  start?: number;
  length?: number;
}

/**
 * Result of diagnostic queries
 */
export interface DiagnosticResult {
  timestamp: number;
  totalErrors: number;
  totalWarnings: number;
  totalSuggestions: number;
  totalMessages: number;
  diagnostics: Diagnostic[];
  compilationTimeMs?: number;
  cacheHit: boolean;
  source: string; // Which config/package this came from
}

/**
 * Batch diagnostic result (multiple files/packages)
 */
export interface BatchDiagnosticResult {
  timestamp: number;
  results: Map<string, DiagnosticResult>;
  totalErrors: number;
  totalWarnings: number;
}

/**
 * Watch status information
 */
export interface WatchStatus {
  active: boolean;
  watchedConfigs: string[];
  watchedFiles: number;
  lastCompilation?: number;
  projectRoot: string;
  mode: 'single' | 'monorepo';
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  itemCount: number;
}

/**
 * Diagnostic query options
 */
export interface DiagnosticQuery {
  category?: DiagnosticCategory;
  minSeverity?: DiagnosticCategory;
  filePattern?: string;
  package?: string; // For monorepo filtering
  errorCode?: number;
}

/**
 * Configuration for TypeScript project
 */
export interface TSProjectConfig {
  configPath: string;
  name?: string; // Package name for monorepo
  rootDir?: string;
}

/**
 * MCP server configuration
 */
export interface MCPConfig {
  // Project configuration
  projectRoot: string;
  tsConfigs: TSProjectConfig[] | string; // Array for monorepo, string for single project

  // Performance tuning
  maxCacheSize?: number; // In MB, default 100
  debounceMs?: number; // Default 500
  maxConcurrentQueries?: number; // Default 10

  // Reliability
  healthCheckInterval?: number; // Default 30000 (30s)
  autoRestartOnCrash?: boolean; // Default true
  fallbackToDirectTsc?: boolean; // Default true

  // Features
  enableIncrementalMode?: boolean; // Default true
  enablePersistentCache?: boolean; // Default false

  // Monorepo settings
  autoDetectWorkspaces?: boolean; // Default true
  workspacePatterns?: string[]; // Glob patterns for workspace packages

  // Filtering
  ignorePatterns?: string[]; // Glob patterns to exclude from diagnostics
}

/**
 * Workspace detection result
 */
export interface WorkspaceInfo {
  type: 'pnpm' | 'yarn' | 'npm' | 'rush' | 'lerna' | 'single';
  packages: TSProjectConfig[];
  rootConfig?: string;
}

/**
 * Type position for advanced queries
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * Type information at position
 */
export interface TypeInfo {
  type: string;
  symbol?: string;
  documentation?: string;
}

/**
 * Definition location
 */
export interface Definition {
  file: string;
  line: number;
  column: number;
}

/**
 * Convert TypeScript diagnostic category to our simplified type
 */
export function convertDiagnosticCategory(category: ts.DiagnosticCategory): DiagnosticCategory {
  switch (category) {
    case 0: // Error
      return 'error';
    case 1: // Warning
      return 'warning';
    case 2: // Suggestion
      return 'suggestion';
    case 3: // Message
      return 'message';
    default:
      return 'error';
  }
}

/**
 * Convert TypeScript diagnostic to our simplified format
 */
export function convertDiagnostic(diagnostic: ts.Diagnostic): Diagnostic {
  const file = diagnostic.file?.fileName || 'unknown';
  const position = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start || 0);

  return {
    file,
    line: position?.line ? position.line + 1 : 0,
    column: position?.character ? position.character + 1 : 0,
    category: convertDiagnosticCategory(diagnostic.category),
    code: diagnostic.code,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    messageText: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    start: diagnostic.start,
    length: diagnostic.length,
  };
}
