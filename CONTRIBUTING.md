# Contributing to TaskBoard

Thank you for your interest in contributing to TaskBoard. This document outlines the process for contributing to the project.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the [existing issues](https://github.com/red-shadows-rs/TaskBoard/issues) to avoid duplicates
2. Use the bug report template if available
3. Include detailed steps to reproduce, expected behavior, and actual behavior
4. Include environment details: Node.js version, browser, OS

### Suggesting Features

1. Check the [roadmap](./README.md#-roadmap) and [existing issues](https://github.com/red-shadows-rs/TaskBoard/issues)
2. Open a feature request with a clear description of the problem and proposed solution
3. Include use cases and any relevant examples

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the project's code style
4. Ensure all checks pass:
   ```bash
   npm run validate
   ```
5. Write clear, descriptive commit messages
6. Push your branch and open a pull request against `main`

### Commit Message Format

Follow this format for commit messages:

```
task-board | vX.Y.Z | Brief description of changes
```

### Development Setup

```bash
git clone https://github.com/red-shadows-rs/TaskBoard.git
cd taskboard
npm install
cp .env.example .env.local
npm run dev
```

### Code Style

- TypeScript strict mode is enabled
- ESLint flat config with typescript-eslint
- Prettier for formatting (2-space indentation, LF line endings, semicolons)
- Run `npm run validate` before committing to ensure all checks pass

### Project Structure

See the [README](./README.md#-project-structure) for a detailed breakdown of the project structure.

## Questions

If you have questions, feel free to open a discussion or issue on GitHub.
