#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const SIZES = {
  S1024: '1024x1024',
  S1024_1792: '1024x1792',
  S1792_1024: '1792x1024'
} as const;

const QUALITIES = {
  STANDARD: 'standard',
  HD: 'hd'
} as const;

const STYLES = {
  VIVID: 'vivid',
  NATURAL: 'natural'
} as const;

// Helper function to convert object values to Zod enum
function objectValuesToZodEnum<T extends string>(obj: Record<string, T>) {
  return Object.values(obj) as [T, ...T[]];
}

// Check for OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

// Initialize MCP server
const server = new McpServer({
  name: "DALL-E 3 Image Generator",
  version: "1.0.0"
});

// OpenAI API response interface
interface OpenAIImageResponse {
  data: Array<{
    url: string;
    revised_prompt: string;
  }>;
}

// Register the generate_image tool
server.tool("generate_image",
  { 
    prompt: z.string().describe("Text prompt for image generation"),
    output_path: z.string().describe("Full path where the image should be saved"),
    size: z.enum(objectValuesToZodEnum(SIZES)).optional().describe("Image size").default(SIZES.S1024),
    quality: z.enum(objectValuesToZodEnum(QUALITIES)).optional().describe("Image quality").default(QUALITIES.HD),
    style: z.enum(objectValuesToZodEnum(STYLES)).optional().describe("Image style").default(STYLES.VIVID),
  },
  async ({ prompt, output_path, size, quality, style }) => {
    try {
      if (!prompt) {
        throw new Error('Missing required parameter: prompt');
      }

      if (!output_path) {
        throw new Error('Missing required parameter: output_path');
      }

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
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
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = (await response.json()) as OpenAIImageResponse;
      const imageUrl = data.data[0]?.url;
      const revisedPrompt = data.data[0]?.revised_prompt;

      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI API');
      }

      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // Handle output path - if it's a directory, generate a filename
      let finalOutputPath = output_path;
      const stats = await stat(output_path).catch(() => null);

      if (stats?.isDirectory() || output_path.endsWith('/') || output_path.endsWith('\\')) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const promptSlug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);
        const filename = `dalle3-${promptSlug}-${timestamp}.png`;
        finalOutputPath = path.join(output_path, filename);
      }

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(finalOutputPath);
      await mkdir(outputDir, { recursive: true });

      // Save the image
      await writeFile(finalOutputPath, Buffer.from(imageBuffer));

      const imageSizeKB = Math.round(imageBuffer.byteLength / 1024);

      return {
        content: [
          {
            type: "text",
            text: `✅ Image generated successfully!

**Original Prompt:** ${prompt}
**Revised Prompt:** ${revisedPrompt || 'N/A'}
**Image URL:** ${imageUrl}
**Saved to:** ${finalOutputPath}
**Size:** ${size}
**Quality:** ${quality}
**Style:** ${style}
**File Size:** ${imageSizeKB} KB

The image has been saved to your specified location and is ready to use.`
          }
        ]
      };
    } catch (error: unknown) {
      console.error("Error generating image:", error);
      return {
        content: [
          { 
            type: "text", 
            text: `Error generating image: ${error instanceof Error ? error.message : String(error)}` 
          }
        ]
      };
    }
  }
);

// Connect to transport and start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('[DALL-E 3 MCP Server] Server running on stdio');

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('[DALL-E 3 MCP Server] Shutting down...');
  process.exit(0);
});