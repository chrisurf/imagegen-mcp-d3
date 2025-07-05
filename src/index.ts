#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GenerateImageArgs {
  prompt: string;
  output_path: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

interface OpenAIImageResponse {
  data: Array<{
    url: string;
    revised_prompt: string;
  }>;
}

export class DallE3MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'dall-e-3-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {
            available: true,
          },
        },
      }
    );

    this.setupToolHandlers();
    this.setupInitializeHandler();

    // Error handling
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_image',
            description: 'Generate an image using DALL-E 3',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Text prompt for image generation',
                },
                output_path: {
                  type: 'string',
                  description: 'Full path where the image should be saved',
                },
                size: {
                  type: 'string',
                  enum: ['1024x1024', '1024x1792', '1792x1024'],
                  default: '1024x1024',
                  description: 'Image size',
                },
                quality: {
                  type: 'string',
                  enum: ['standard', 'hd'],
                  default: 'hd',
                  description: 'Image quality',
                },
                style: {
                  type: 'string',
                  enum: ['vivid', 'natural'],
                  default: 'vivid',
                  description: 'Image style',
                },
              },
              required: ['prompt', 'output_path'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'generate_image') {
        return await this.generateImage(args as unknown as GenerateImageArgs);
      } else {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  private setupInitializeHandler(): void {
    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      console.error('[DALL-E 3 MCP Server] Initialize request received from client');
      console.error('[DALL-E 3 MCP Server] Client info:', JSON.stringify(request.params.clientInfo, null, 2));
      console.error('[DALL-E 3 MCP Server] Protocol version requested:', request.params.protocolVersion);

      return {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            available: true,
          },
        },
        serverInfo: {
          name: 'dall-e-3-mcp-server',
          version: '1.0.0',
        },
        instructions: 'Use the "generate_image" tool to generate images using a DALL·E 3 prompt.',
      };
    });
  }

  private async generateImage(args: GenerateImageArgs) {
    const {
      prompt,
      output_path,
      size = '1024x1024',
      quality = 'hd',
      style = 'vivid',
    } = args;

    if (!prompt) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: prompt');
    }

    if (!output_path) {
      throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: output_path');
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new McpError(ErrorCode.InternalError, 'OPENAI_API_KEY environment variable not set');
    }

    try {
      console.error('[DALL-E 3] Starting image generation...');
      console.error('[DALL-E 3] Prompt:', prompt);
      console.error('[DALL-E 3] Output path:', output_path);

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size,
          quality,
          style,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DALL-E 3] API Error:', errorText);
        throw new McpError(ErrorCode.InternalError, `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = (await response.json()) as OpenAIImageResponse;
      const imageUrl = data.data[0]?.url;
      const revisedPrompt = data.data[0]?.revised_prompt;

      if (!imageUrl) {
        throw new McpError(ErrorCode.InternalError, 'No image URL returned from OpenAI API');
      }

      console.error('[DALL-E 3] Generated image URL:', imageUrl);
      console.error('[DALL-E 3] Revised prompt:', revisedPrompt);

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new McpError(ErrorCode.InternalError, `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      let finalOutputPath = output_path;
      const stats = await stat(output_path).catch(() => null);

      if (stats?.isDirectory() || output_path.endsWith('/') || output_path.endsWith('\\')) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const promptSlug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);
        const filename = `dalle3-${promptSlug}-${timestamp}.png`;
        finalOutputPath = path.join(output_path, filename);
        console.error(`[DALL-E 3] Directory detected, using filename: ${filename}`);
      }

      const outputDir = path.dirname(finalOutputPath);
      await mkdir(outputDir, { recursive: true });
      await writeFile(finalOutputPath, Buffer.from(imageBuffer));

      const imageSizeKB = Math.round(imageBuffer.byteLength / 1024);

      console.error(`[DALL-E 3] ✅ Image saved successfully to: ${finalOutputPath}`);
      console.error(`[DALL-E 3] 📏 Image size: ${imageSizeKB} KB`);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Image generated successfully!

**Original Prompt:** ${prompt}
**Revised Prompt:** ${revisedPrompt || 'N/A'}
**Image URL:** ${imageUrl}
**Saved to:** ${finalOutputPath}
**Size:** ${size}
**Quality:** ${quality}
**Style:** ${style}
**File Size:** ${imageSizeKB} KB

The image has been saved to your specified location and is ready to use.`,
          },
        ],
      };
    } catch (error) {
      console.error('[DALL-E 3] Error:', error);
      if (error instanceof McpError) throw error;
      throw new McpError(ErrorCode.InternalError, `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[DALL-E 3 MCP Server] Server running on stdio');
  }
}

const server = new DallE3MCPServer();
server.run().catch(console.error);