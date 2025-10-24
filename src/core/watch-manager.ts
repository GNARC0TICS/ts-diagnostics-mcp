/**
 * TypeScript Watch Manager - Core diagnostic collection engine
 */

import ts from 'typescript';
import { EventEmitter } from 'node:events';
import { existsSync } from 'node:fs';
import type {
  Diagnostic,
  DiagnosticResult,
  TSProjectConfig,
  WatchStatus,
} from '../types/index.js';
import { convertDiagnostic } from '../types/index.js';
import { DiagnosticCache } from '../utils/cache.js';

/**
 * Manages TypeScript watch programs for one or more projects
 */
export class TypeScriptWatchManager extends EventEmitter {
  private watchers = new Map<string, ts.WatchOfConfigFile<ts.BuilderProgram>>();
  private diagnosticsByConfig = new Map<string, Map<string, Diagnostic[]>>();
  private cache: DiagnosticCache;
  private isActive = false;
  private lastCompilation?: number;
  private configs: TSProjectConfig[];

  constructor(configs: TSProjectConfig[], cacheSizeMB = 100) {
    super();
    this.configs = configs;
    this.cache = new DiagnosticCache(cacheSizeMB);
  }

  /**
   * Start watching all configured projects
   */
  start(): void {
    if (this.isActive) {
      console.warn('Watch manager already active');
      return;
    }

    this.isActive = true;

    for (const config of this.configs) {
      this.startWatchingConfig(config);
    }

    this.emit('started', { configs: this.configs.length });
  }

  /**
   * Start watching a single tsconfig
   */
  private startWatchingConfig(config: TSProjectConfig): void {
    const { configPath, name } = config;

    if (!existsSync(configPath)) {
      console.error(`tsconfig not found: ${configPath}`);
      return;
    }

    console.log(`Starting watch for ${name || configPath}...`);

    // Create watch compiler host
    const host = ts.createWatchCompilerHost(
      configPath,
      {
        noEmit: true, // We only want diagnostics, no output files
      },
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      (diagnostic) => this.onDiagnostic(config, diagnostic),
      (diagnostic) => this.onWatchStatusChange(config, diagnostic)
    );

    // Customize file watching to reduce overhead
    const originalCreateProgram = host.createProgram;
    host.createProgram = (rootNames, options, host, oldProgram) => {
      return originalCreateProgram(rootNames, options, host, oldProgram);
    };

    // Start watching
    const watcher = ts.createWatchProgram(host);
    this.watchers.set(configPath, watcher);

    // Initialize diagnostic map for this config
    this.diagnosticsByConfig.set(configPath, new Map());
  }

  /**
   * Handle individual diagnostic from TypeScript
   */
  private onDiagnostic(config: TSProjectConfig, diagnostic: ts.Diagnostic): void {
    const converted = convertDiagnostic(diagnostic);
    const diagnosticMap = this.diagnosticsByConfig.get(config.configPath);

    if (!diagnosticMap) return;

    const fileName = converted.file;

    // Store diagnostic
    if (!diagnosticMap.has(fileName)) {
      diagnosticMap.set(fileName, []);
    }

    const fileDiagnostics = diagnosticMap.get(fileName)!;
    fileDiagnostics.push(converted);

    // Update cache
    this.cache.set(`${config.configPath}:${fileName}`, fileDiagnostics);

    // Emit event
    this.emit('diagnostic', {
      config: config.name,
      file: fileName,
      diagnostic: converted,
    });
  }

  /**
   * Handle watch status changes
   */
  private onWatchStatusChange(config: TSProjectConfig, diagnostic: ts.Diagnostic): void {
    const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

    // Check if this is a compilation complete message
    if (messageText.includes('Found 0 errors') || messageText.includes('Watching for file changes')) {
      this.lastCompilation = Date.now();

      // Get current diagnostics for this config
      const diagnostics = this.getAllDiagnosticsForConfig(config.configPath);

      this.emit('compilation-complete', {
        config: config.name,
        timestamp: this.lastCompilation,
        errorCount: diagnostics.filter(d => d.category === 'error').length,
        warningCount: diagnostics.filter(d => d.category === 'warning').length,
      });
    }

    // Log status
    console.log(`[${config.name}] ${messageText}`);
  }

  /**
   * Get all diagnostics for a specific config
   */
  private getAllDiagnosticsForConfig(configPath: string): Diagnostic[] {
    const diagnosticMap = this.diagnosticsByConfig.get(configPath);
    if (!diagnosticMap) return [];

    const allDiagnostics: Diagnostic[] = [];

    for (const fileDiagnostics of diagnosticMap.values()) {
      allDiagnostics.push(...fileDiagnostics);
    }

    return allDiagnostics;
  }

  /**
   * Get all diagnostics across all configs
   */
  getAllDiagnostics(): DiagnosticResult {
    const allDiagnostics: Diagnostic[] = [];

    for (const [configPath, _] of this.diagnosticsByConfig) {
      const configDiagnostics = this.getAllDiagnosticsForConfig(configPath);
      allDiagnostics.push(...configDiagnostics);
    }

    return this.buildDiagnosticResult(allDiagnostics, 'all', true);
  }

  /**
   * Get diagnostics for a specific file
   */
  getFileDiagnostics(filePath: string): DiagnosticResult {
    const diagnostics: Diagnostic[] = [];

    // Check cache first
    for (const config of this.configs) {
      const cacheKey = `${config.configPath}:${filePath}`;
      const cached = this.cache.get(cacheKey);

      if (cached) {
        diagnostics.push(...cached);
      }
    }

    return this.buildDiagnosticResult(diagnostics, filePath, diagnostics.length > 0);
  }

  /**
   * Get diagnostics for a specific package (monorepo)
   */
  getPackageDiagnostics(packageName: string): DiagnosticResult | null {
    const config = this.configs.find(c => c.name === packageName);
    if (!config) return null;

    const diagnostics = this.getAllDiagnosticsForConfig(config.configPath);
    return this.buildDiagnosticResult(diagnostics, packageName, true);
  }

  /**
   * Check if there are any errors
   */
  hasErrors(filePath?: string): boolean {
    if (filePath) {
      const result = this.getFileDiagnostics(filePath);
      return result.totalErrors > 0;
    }

    const result = this.getAllDiagnostics();
    return result.totalErrors > 0;
  }

  /**
   * Get diagnostic count summary
   */
  getDiagnosticCount(): { errors: number; warnings: number; suggestions: number } {
    const result = this.getAllDiagnostics();

    return {
      errors: result.totalErrors,
      warnings: result.totalWarnings,
      suggestions: result.totalSuggestions,
    };
  }

  /**
   * Get watch status
   */
  getStatus(): WatchStatus {
    return {
      active: this.isActive,
      watchedConfigs: this.configs.map(c => c.configPath),
      watchedFiles: this.getTotalFilesWatched(),
      lastCompilation: this.lastCompilation,
      projectRoot: this.configs[0]?.rootDir || '',
      mode: this.configs.length > 1 ? 'monorepo' : 'single',
    };
  }

  /**
   * Get total files being watched
   */
  private getTotalFilesWatched(): number {
    let total = 0;

    for (const diagnosticMap of this.diagnosticsByConfig.values()) {
      total += diagnosticMap.size;
    }

    return total;
  }

  /**
   * Clear diagnostics for a file
   */
  clearFileDiagnostics(filePath: string): void {
    for (const [configPath, diagnosticMap] of this.diagnosticsByConfig) {
      diagnosticMap.delete(filePath);
      this.cache.delete(`${configPath}:${filePath}`);
    }

    this.emit('cleared', { file: filePath });
  }

  /**
   * Clear all diagnostics
   */
  clearAllDiagnostics(): void {
    for (const diagnosticMap of this.diagnosticsByConfig.values()) {
      diagnosticMap.clear();
    }

    this.cache.clear();
    this.emit('cleared', { file: 'all' });
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (!this.isActive) return;

    for (const watcher of this.watchers.values()) {
      watcher.close();
    }

    this.watchers.clear();
    this.isActive = false;

    this.emit('stopped');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Build a diagnostic result object
   */
  private buildDiagnosticResult(
    diagnostics: Diagnostic[],
    source: string,
    cacheHit: boolean
  ): DiagnosticResult {
    return {
      timestamp: Date.now(),
      totalErrors: diagnostics.filter(d => d.category === 'error').length,
      totalWarnings: diagnostics.filter(d => d.category === 'warning').length,
      totalSuggestions: diagnostics.filter(d => d.category === 'suggestion').length,
      totalMessages: diagnostics.filter(d => d.category === 'message').length,
      diagnostics,
      cacheHit,
      source,
    };
  }

  /**
   * Trigger recompilation (force refresh)
   */
  triggerRecompile(): void {
    // TypeScript watch mode automatically recompiles on file changes
    // We can emit an event to notify listeners
    this.emit('recompile-requested');
  }

  /**
   * Get list of all packages (for monorepo)
   */
  getPackages(): string[] {
    return this.configs.map(c => c.name || c.configPath);
  }
}
