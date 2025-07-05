# Contributing to imagegen-mcp-d3

Thank you for your interest in contributing to imagegen-mcp-d3! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and what behavior you expected to see
- Include screenshots if applicable
- Provide your environment details (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the enhancement
- Describe the current behavior and explain which behavior you expected to see
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch from `main` for your feature or fix
3. Make your changes
4. Add tests for any new functionality
5. Ensure all tests pass
6. Follow the coding standards
7. Commit your changes with clear, descriptive messages
8. Push to your fork and submit a pull request

## Development Process

### Setting Up Your Development Environment

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/imagegen-mcp-d3.git
   cd imagegen-mcp-d3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

Before submitting a pull request, ensure your code meets our quality standards:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format

# Build
npm run build
```

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write comprehensive tests for new functionality
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Handle errors appropriately

### Commit Messages

Use clear and meaningful commit messages following the conventional commits format:

- `feat: add new feature`
- `fix: resolve bug in image generation`
- `docs: update README with new examples`
- `test: add tests for error handling`
- `refactor: improve code structure`
- `chore: update dependencies`

### Testing Guidelines

- Write unit tests for all new functionality
- Ensure tests are deterministic and independent
- Mock external dependencies (OpenAI API, file system)
- Test both success and failure scenarios
- Aim for high test coverage (>90%)

### Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md following the Keep a Changelog format
- Add JSDoc comments for new public APIs
- Update type definitions as needed

## Project Structure

```
src/
├── index.ts           # Main server implementation
├── types.ts          # TypeScript type definitions
└── __tests__/        # Test files
    └── index.test.ts # Main test suite

.github/
└── workflows/
    └── ci-cd.yml     # GitHub Actions CI/CD pipeline

docs/                 # Additional documentation
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with release notes
3. Create a new release on GitHub
4. The CI/CD pipeline will automatically publish to NPM

## Getting Help

If you need help, you can:

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Review existing documentation and examples

## Recognition

Contributors will be recognized in the project README and release notes. We appreciate all contributions, big and small!

## License

By contributing to imagegen-mcp-d3, you agree that your contributions will be licensed under the MIT License.
