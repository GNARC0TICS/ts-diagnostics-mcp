/**
 * MCP Server for TypeScript Diagnostics
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import type { TypeScriptWatchManager } from '../core/watch-manager.js';

/**
 * MCP Server wrapping the TypeScript Watch Manager
 */
export class TypeScriptDiagnosticsMCPServer {
  private server: Server;
  private watchManager: TypeScriptWatchManager;

  constructor(watchManager: TypeScriptWatchManager) {
    this.watchManager = watchManager;

    this.server = new Server(
      {
        name: 'ts-diagnostics-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupEventListeners();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getToolDefinitions(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_all_diagnostics':
            return this.getAllDiagnostics();

          case 'get_file_diagnostics':
            return this.getFileDiagnostics(args as { filePath: string });

          case 'get_package_diagnostics':
            return this.getPackageDiagnostics(args as { packageName: string });

          case 'has_errors':
            return this.hasErrors(args as { filePath?: string });

          case 'get_diagnostic_count':
            return this.getDiagnosticCount();

          case 'get_watch_status':
            return this.getWatchStatus();

          case 'get_cache_stats':
            return this.getCacheStats();

          case 'clear_cache':
            return this.clearCache(args as { filePath?: string });

          case 'list_packages':
            return this.listPackages();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup event listeners for watch manager
   */
  private setupEventListeners(): void {
    this.watchManager.on('compilation-complete', (data: any) => {
      console.error(`[${data.config}] Compilation complete - ${data.errorCount} errors, ${data.warningCount} warnings`);
    });

    this.watchManager.on('diagnostic', (_data: any) => {
      // Optional: Could emit notifications to MCP clients if supported
    });
  }

  /**
   * Get tool definitions
   */
  private getToolDefinitions(): Tool[] {
    return [
      {
        name: 'get_all_diagnostics',
        description:
          'Get all TypeScript diagnostics from all watched projects. Returns errors, warnings, and suggestions with file locations.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_file_diagnostics',
        description:
          'Get TypeScript diagnostics for a specific file. Much faster than running tsc on the whole project.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the TypeScript file',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'get_package_diagnostics',
        description:
          'Get TypeScript diagnostics for a specific package in a monorepo. Useful for filtering diagnostics by workspace.',
        inputSchema: {
          type: 'object',
          properties: {
            packageName: {
              type: 'string',
              description: 'Name of the package (e.g., "@degentalk/server")',
            },
          },
          required: ['packageName'],
        },
      },
      {
        name: 'has_errors',
        description:
          'Quick boolean check if there are any TypeScript errors. Optionally check a specific file. Extremely fast - use this before full diagnostic queries.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Optional: Path to specific file to check',
            },
          },
          required: [],
        },
      },
      {
        name: 'get_diagnostic_count',
        description:
          'Get summary counts of errors, warnings, and suggestions. Faster than getting full diagnostics.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_watch_status',
        description:
          'Get status of the TypeScript watch process including watched configs, file count, and last compilation time.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_cache_stats',
        description:
          'Get cache performance statistics including hit rate, size, and evictions.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'clear_cache',
        description:
          'Clear cached diagnostics. Optionally clear cache for a specific file only.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Optional: Path to specific file to clear from cache',
            },
          },
          required: [],
        },
      },
      {
        name: 'list_packages',
        description:
          'List all packages in the monorepo that are being watched. Useful for discovering available package names.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ];
  }

  /**
   * Tool implementations
   */
  private async getAllDiagnostics(): Promise<CallToolResult> {
    const result = this.watchManager.getAllDiagnostics();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getFileDiagnostics(args: { filePath: string }): Promise<CallToolResult> {
    const result = this.watchManager.getFileDiagnostics(args.filePath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getPackageDiagnostics(args: { packageName: string }): Promise<CallToolResult> {
    const result = this.watchManager.getPackageDiagnostics(args.packageName);

    if (!result) {
      return {
        content: [
          {
            type: 'text',
            text: `Package not found: ${args.packageName}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async hasErrors(args: { filePath?: string }): Promise<CallToolResult> {
    const hasErrors = this.watchManager.hasErrors(args.filePath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ hasErrors, file: args.filePath || 'all' }),
        },
      ],
    };
  }

  private async getDiagnosticCount(): Promise<CallToolResult> {
    const counts = this.watchManager.getDiagnosticCount();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(counts, null, 2),
        },
      ],
    };
  }

  private async getWatchStatus(): Promise<CallToolResult> {
    const status = this.watchManager.getStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }

  private async getCacheStats(): Promise<CallToolResult> {
    const stats = this.watchManager.getCacheStats();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  private async clearCache(args: { filePath?: string }): Promise<CallToolResult> {
    if (args.filePath) {
      this.watchManager.clearFileDiagnostics(args.filePath);
    } else {
      this.watchManager.clearAllDiagnostics();
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            cleared: args.filePath || 'all',
            success: true,
          }),
        },
      ],
    };
  }

  private async listPackages(): Promise<CallToolResult> {
    const packages = this.watchManager.getPackages();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ packages }, null, 2),
        },
      ],
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('TypeScript Diagnostics MCP Server running on stdio');
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    await this.server.close();
  }
}
