/**
 * Diagnostic caching utilities
 */

import { LRUCache } from 'lru-cache';
import type { Diagnostic, CacheStats } from '../types/index.js';

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  diagnostics: Diagnostic[];
  timestamp: number;
  fileHash?: string;
}

/**
 * Diagnostic cache with LRU eviction
 */
export class DiagnosticCache {
  private cache: LRUCache<string, CacheEntry>;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(maxSizeMB = 100) {
    // Calculate max number of items based on size
    // Assume average diagnostic is ~200 bytes
    const avgDiagnosticSize = 200;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const maxItems = Math.floor(maxBytes / avgDiagnosticSize);

    this.cache = new LRUCache<string, CacheEntry>({
      max: maxItems,
      ttl: 1000 * 60 * 60, // 1 hour TTL
      updateAgeOnGet: true,
      dispose: () => {
        this.stats.evictions++;
      },
    });
  }

  /**
   * Get cached diagnostics for a file
   */
  get(key: string): Diagnostic[] | null {
    const entry = this.cache.get(key);

    if (entry) {
      this.stats.hits++;
      return entry.diagnostics;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set diagnostics for a file
   */
  set(key: string, diagnostics: Diagnostic[], fileHash?: string): void {
    this.cache.set(key, {
      diagnostics,
      timestamp: Date.now(),
      fileHash,
    });
  }

  /**
   * Check if cache has entry
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached diagnostics
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: RegExp): number {
    let count = 0;

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      itemCount: this.cache.size,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * Get all cached file paths
   */
  getCachedFiles(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Warm cache with initial diagnostics
   */
  warmCache(entries: Map<string, Diagnostic[]>): void {
    for (const [file, diagnostics] of entries) {
      this.set(file, diagnostics);
    }
  }
}

/**
 * Simple file hash for change detection
 */
export function hashFile(content: string): string {
  let hash = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash.toString(36);
}
