# DALL-E 3 MCP Server

![CI/CD Pipeline](https://github.com/chrisurf/imagegen-mcp-d3/actions/workflows/ci-cd.yml/badge.svg)
![npm version](https://img.shields.io/npm/v/imagegen-mcp-d3)
![License](https://img.shields.io/github/license/chrisurf/imagegen-mcp-d3)
![Node.js Version](https://img.shields.io/node/v/imagegen-mcp-d3)

A Model Context Protocol (MCP) server that provides DALL-E 3 image generation capabilities. This server allows LLMs to generate high-quality images using OpenAI's DALL-E 3 model through the standardized MCP interface.

## Features

- 🎨 **High-Quality Image Generation**: Uses DALL-E 3 for state-of-the-art image creation
- 🔧 **Flexible Configuration**: Support for different sizes, quality levels, and styles
- 📁 **Automatic File Management**: Handles directory creation and file saving
- 🛡️ **Robust Error Handling**: Comprehensive error handling with detailed feedback
- 📊 **Detailed Logging**: Comprehensive logging for debugging and monitoring
- 🚀 **TypeScript**: Fully typed for better development experience
- 🧪 **Well Tested**: Comprehensive test suite with high coverage

## Installation

### Using NPX (Recommended)

```bash
npx imagegen-mcp-d3
```

### Using NPM

```bash
npm install -g imagegen-mcp-d3
```

### From Source

```bash
git clone https://github.com/chrisurf/imagegen-mcp-d3.git
cd imagegen-mcp-d3
npm install
npm run build
npm start
```

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **OpenAI API Key**: You need a valid OpenAI API key with DALL-E 3 access

## Configuration

### Environment Variables

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

Or create a `.env` file in your project root:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

## Usage

### With Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "imagegen-mcp-d3": {
      "command": "npx",
      "args": ["imagegen-mcp-d3"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

### With Other MCP Clients

The server implements the standard MCP protocol and can be used with any compatible client.

## Available Tools

### `generate_image`

Generates an image using DALL-E 3 and saves it to the specified location.

**Parameters:**

- `prompt` (required): Text description of the image to generate
- `output_path` (required): Full file path where the image should be saved
- `size` (optional): Image dimensions - `"1024x1024"`, `"1024x1792"`, or `"1792x1024"` (default: `"1024x1024"`)
- `quality` (optional): Image quality - `"standard"` or `"hd"` (default: `"hd"`)
- `style` (optional): Image style - `"vivid"` or `"natural"` (default: `"vivid"`)

**Example:**

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "A serene sunset over a mountain lake with pine trees",
    "output_path": "/Users/username/Pictures/sunset_lake.png",
    "size": "1024x1792",
    "quality": "hd",
    "style": "natural"
  }
}
```

**Response:**

The tool returns detailed information about the generated image, including:
- Original and revised prompts
- Image URL
- File save location
- Image specifications
- File size

## API Reference

### Image Sizes

- **Square**: `1024x1024` - Perfect for social media and general use
- **Portrait**: `1024x1792` - Great for mobile wallpapers and vertical displays
- **Landscape**: `1792x1024` - Ideal for desktop wallpapers and horizontal displays

### Quality Options

- **Standard**: Faster generation, good quality
- **HD**: Higher quality with more detail (recommended)

### Style Options

- **Vivid**: More dramatic and artistic interpretations
- **Natural**: More realistic and natural-looking results

## Development

### Setup

```bash
git clone https://github.com/chrisurf/imagegen-mcp-d3.git
cd imagegen-mcp-d3
npm install
```

### Available Scripts

```bash
npm run dev          # Run in development mode with hot reload
npm run build        # Build for production
npm run start        # Start the built server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run typecheck    # Run TypeScript type checking
```

### Project Structure

```
src/
├── index.ts           # Main server implementation
├── types.ts          # TypeScript type definitions
└── __tests__/        # Test files
    └── index.test.ts # Main test suite
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

## Error Handling

The server provides comprehensive error handling for common scenarios:

- **Missing API Key**: Clear error message when `OPENAI_API_KEY` is not set
- **Invalid Parameters**: Validation errors for required and optional parameters
- **API Errors**: Detailed error messages from the OpenAI API
- **File System Errors**: Handling of directory creation and file writing issues
- **Network Errors**: Graceful handling of network connectivity issues

## Logging

The server provides detailed logging for monitoring and debugging:

- Request initiation and parameters
- API communication status
- Image generation progress
- File saving confirmation
- Error details and stack traces

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Testing**: Automated testing on multiple Node.js versions (18, 20, 22)
- **Code Quality**: ESLint, Prettier, and TypeScript checks
- **Security**: Dependency vulnerability scanning
- **Publishing**: Automatic NPM publishing on release
- **Coverage**: Local code coverage reporting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/chrisurf/imagegen-mcp-d3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/chrisurf/imagegen-mcp-d3/discussions)
- **Email**: [Open an issue](https://github.com/chrisurf/imagegen-mcp-d3/issues/new) for support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification) - The official MCP specification
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - TypeScript SDK for MCP
- [Claude Desktop](https://claude.ai/desktop) - AI assistant that supports MCP servers

## Acknowledgments

- OpenAI for the DALL-E 3 API
- Anthropic for the Model Context Protocol specification
- The MCP community for tools and documentation
High-performance MCP for generating images using DALL·E 3 – optimized for fast, scalable, and customizable inference workflows.
