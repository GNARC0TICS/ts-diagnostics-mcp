/**
 * Workspace detection and monorepo support utilities
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { WorkspaceInfo, TSProjectConfig } from '../types/index.js';

/**
 * Detect workspace type and configuration
 */
export async function detectWorkspace(projectRoot: string): Promise<WorkspaceInfo> {
  // Try pnpm-workspace.yaml
  const pnpmWorkspace = join(projectRoot, 'pnpm-workspace.yaml');
  if (existsSync(pnpmWorkspace)) {
    const packages = await detectPnpmWorkspaces(projectRoot);
    return {
      type: 'pnpm',
      packages,
      rootConfig: join(projectRoot, 'tsconfig.json'),
    };
  }

  // Try package.json workspaces (npm/yarn)
  const packageJson = join(projectRoot, 'package.json');
  if (existsSync(packageJson)) {
    const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
    if (pkg.workspaces) {
      const packages = await detectNpmWorkspaces(projectRoot, pkg.workspaces);
      return {
        type: pkg.packageManager?.startsWith('yarn') ? 'yarn' : 'npm',
        packages,
        rootConfig: join(projectRoot, 'tsconfig.json'),
      };
    }
  }

  // Try rush.json
  const rushJson = join(projectRoot, 'rush.json');
  if (existsSync(rushJson)) {
    const packages = await detectRushWorkspaces(projectRoot);
    return {
      type: 'rush',
      packages,
      rootConfig: join(projectRoot, 'tsconfig.json'),
    };
  }

  // Try lerna.json
  const lernaJson = join(projectRoot, 'lerna.json');
  if (existsSync(lernaJson)) {
    const packages = await detectLernaWorkspaces(projectRoot);
    return {
      type: 'lerna',
      packages,
      rootConfig: join(projectRoot, 'tsconfig.json'),
    };
  }

  // Single project
  return {
    type: 'single',
    packages: [{
      configPath: join(projectRoot, 'tsconfig.json'),
      name: 'root',
      rootDir: projectRoot,
    }],
  };
}

/**
 * Detect pnpm workspace packages
 */
async function detectPnpmWorkspaces(projectRoot: string): Promise<TSProjectConfig[]> {
  const glob = (await import('fast-glob')).default;

  // Read pnpm-workspace.yaml
  const workspaceFile = join(projectRoot, 'pnpm-workspace.yaml');
  const content = readFileSync(workspaceFile, 'utf-8');

  // Simple YAML parsing (just get packages array)
  const packagesMatch = content.match(/packages:\s*\n((?:\s+-\s+.+\n?)+)/);
  if (!packagesMatch) return [];

  const patterns = packagesMatch[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.replace(/^-\s+['"]?(.+?)['"]?\s*$/, '$1'));

  // Find all package.json files in workspace patterns
  const packagePaths = await glob(
    patterns.map(p => `${p}/package.json`),
    { cwd: projectRoot, absolute: true }
  );

  // Convert to TSProjectConfig
  const configs: TSProjectConfig[] = [];

  for (const pkgPath of packagePaths) {
    const dir = dirname(pkgPath);
    const tsconfigPath = join(dir, 'tsconfig.json');

    if (!existsSync(tsconfigPath)) continue;

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      configs.push({
        configPath: tsconfigPath,
        name: pkg.name || dirname(pkgPath).split('/').pop(),
        rootDir: dir,
      });
    } catch {
      continue;
    }
  }

  return configs;
}

/**
 * Detect npm/yarn workspace packages
 */
async function detectNpmWorkspaces(
  projectRoot: string,
  workspaces: string[] | { packages: string[] }
): Promise<TSProjectConfig[]> {
  const glob = (await import('fast-glob')).default;

  const patterns = Array.isArray(workspaces) ? workspaces : workspaces.packages;

  const packagePaths = await glob(
    patterns.map(p => `${p}/package.json`),
    { cwd: projectRoot, absolute: true }
  );

  const configs: TSProjectConfig[] = [];

  for (const pkgPath of packagePaths) {
    const dir = dirname(pkgPath);
    const tsconfigPath = join(dir, 'tsconfig.json');

    if (!existsSync(tsconfigPath)) continue;

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      configs.push({
        configPath: tsconfigPath,
        name: pkg.name || dirname(pkgPath).split('/').pop(),
        rootDir: dir,
      });
    } catch {
      continue;
    }
  }

  return configs;
}

/**
 * Detect Rush workspace packages
 */
async function detectRushWorkspaces(projectRoot: string): Promise<TSProjectConfig[]> {
  const rushJson = join(projectRoot, 'rush.json');
  const config = JSON.parse(readFileSync(rushJson, 'utf-8'));

  const configs: TSProjectConfig[] = [];

  for (const project of config.projects as Array<{ projectFolder: string; packageName: string }>) {
    const dir = join(projectRoot, project.projectFolder);
    const tsconfigPath = join(dir, 'tsconfig.json');

    if (!existsSync(tsconfigPath)) continue;

    configs.push({
      configPath: tsconfigPath,
      name: project.packageName,
      rootDir: dir,
    });
  }

  return configs;
}

/**
 * Detect Lerna workspace packages
 */
async function detectLernaWorkspaces(projectRoot: string): Promise<TSProjectConfig[]> {
  const glob = (await import('fast-glob')).default;

  const lernaJson = join(projectRoot, 'lerna.json');
  const config = JSON.parse(readFileSync(lernaJson, 'utf-8'));

  const patterns = config.packages || ['packages/*'];

  const packagePaths = await glob(
    patterns.map((p: string) => `${p}/package.json`),
    { cwd: projectRoot, absolute: true }
  );

  const configs: TSProjectConfig[] = [];

  for (const pkgPath of packagePaths) {
    const dir = dirname(pkgPath);
    const tsconfigPath = join(dir, 'tsconfig.json');

    if (!existsSync(tsconfigPath)) continue;

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      configs.push({
        configPath: tsconfigPath,
        name: pkg.name || dirname(pkgPath).split('/').pop(),
        rootDir: dir,
      });
    } catch {
      continue;
    }
  }

  return configs;
}

/**
 * Find all tsconfig files in a project (fallback)
 */
export async function findAllTsConfigs(projectRoot: string): Promise<TSProjectConfig[]> {
  const glob = (await import('fast-glob')).default;

  const tsconfigPaths = await glob('**/tsconfig.json', {
    cwd: projectRoot,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  });

  return tsconfigPaths.map(configPath => ({
    configPath,
    name: dirname(configPath).split('/').pop() || 'unknown',
    rootDir: dirname(configPath),
  }));
}
