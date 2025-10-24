/**
 * File ignore utilities using glob patterns
 */

/**
 * Check if a file path matches any ignore pattern
 */
export function shouldIgnoreFile(filePath: string, ignorePatterns: string[]): boolean {
  if (!ignorePatterns || ignorePatterns.length === 0) {
    return false;
  }

  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const pattern of ignorePatterns) {
    if (matchesPattern(normalizedPath, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Simple glob pattern matching
 * Supports: *, **, ?, [abc], {a,b}
 */
function matchesPattern(path: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = globToRegex(pattern);
  return regexPattern.test(path);
}

/**
 * Convert glob pattern to regular expression
 */
function globToRegex(glob: string): RegExp {
  let regex = glob;

  // Escape special regex characters except glob wildcards
  regex = regex.replace(/[.+^${}()|[\]\\]/g, '\\$&');

  // Handle ** (match any number of directories)
  regex = regex.replace(/\\\*\\\*/g, '.*');

  // Handle * (match anything except /)
  regex = regex.replace(/\\\*/g, '[^/]*');

  // Handle ? (match single character except /)
  regex = regex.replace(/\?/g, '[^/]');

  // Handle {a,b,c} alternatives
  regex = regex.replace(/\{([^}]+)\}/g, (_, alternatives) => {
    return `(${alternatives.split(',').join('|')})`;
  });

  // Handle [abc] character classes (already escaped correctly)
  // No additional handling needed as we escaped [ and ] above but they work in regex

  // Add anchors
  regex = `^${regex}$`;

  return new RegExp(regex);
}

/**
 * Filter an array of file paths based on ignore patterns
 */
export function filterIgnoredFiles(
  files: string[],
  ignorePatterns: string[]
): string[] {
  if (!ignorePatterns || ignorePatterns.length === 0) {
    return files;
  }

  return files.filter(file => !shouldIgnoreFile(file, ignorePatterns));
}

/**
 * Check if a tsconfig path should be ignored
 */
export function shouldIgnoreTsConfig(
  configPath: string,
  ignorePatterns: string[]
): boolean {
  // Always process root-level tsconfig files
  if (configPath.endsWith('/tsconfig.json') && !configPath.includes('node_modules')) {
    return false;
  }

  return shouldIgnoreFile(configPath, ignorePatterns);
}
