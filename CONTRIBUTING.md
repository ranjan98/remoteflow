# Contributing to RemoteFlow

Thank you for considering contributing to RemoteFlow! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)
- Error messages or logs

### Suggesting Features

Feature suggestions are welcome! Please:

- Check existing feature requests first
- Explain the problem you're trying to solve
- Describe your proposed solution
- Consider how it fits with RemoteFlow's privacy-first philosophy

### Pull Requests

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/remoteflow.git
   cd remoteflow
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm run build
   npm run dev -- <your-command>
   ```

5. **Commit**
   ```bash
   git commit -m "Add feature: brief description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for adding tests

6. **Push & Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub

## Development Setup

### Prerequisites

- Node.js 22+
- npm or pnpm
- Git

### Local Development

```bash
# Install dependencies
npm install

# Run in dev mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── integrations/    # Third-party API integrations
├── automations/     # Core automation features
├── types/           # TypeScript types
├── config/          # Configuration handling
├── cli.ts           # CLI commands
└── index.ts         # Entry point
```

## Code Style

- Use TypeScript with strict mode
- Use async/await over promises
- Prefer const over let
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Example

```typescript
/**
 * Generates a daily standup report from GitHub activity
 * @param since - Start date for activity lookup
 * @returns Formatted standup data
 */
async function generateStandup(since: Date): Promise<StandupData> {
  // Implementation
}
```

## Adding New Integrations

To add a new integration (e.g., Jira, Notion):

1. Create a new file in `src/integrations/`
2. Export a class with clear methods
3. Handle errors gracefully
4. Add types in `src/types/`
5. Update configuration in `src/config/`
6. Add CLI commands in `src/cli.ts`
7. Document in README.md

### Integration Template

```typescript
export class MyIntegration {
  private client: any;

  constructor(apiKey: string) {
    this.client = new MyClient({ auth: apiKey });
  }

  async doSomething(): Promise<Result> {
    try {
      const data = await this.client.fetch();
      return this.formatData(data);
    } catch (error) {
      console.error('Error in MyIntegration:', error);
      throw error;
    }
  }
}
```

## Adding New Commands

1. Add command in `src/cli.ts`:

```typescript
program
  .command('mycommand')
  .description('What it does')
  .option('-f, --flag', 'Description')
  .action(async (options) => {
    // Implementation
  });
```

2. Update README with usage examples

## Testing

Currently, manual testing is the primary method. Contributions for automated tests are welcome!

### Manual Testing Checklist

- [ ] Command runs without errors
- [ ] Error messages are clear
- [ ] Help text is accurate
- [ ] Output is formatted correctly
- [ ] Works with different configurations

## Documentation

When adding features:

- Update README.md with usage examples
- Add inline code comments
- Update .env.example if new config needed
- Consider adding to CONTRIBUTING.md if it affects contributors

## Privacy Guidelines

RemoteFlow is privacy-first. When contributing:

- Never send data to external services without explicit user consent
- Store sensitive data (tokens) in .env only
- Process data locally when possible
- Add clear documentation about what data is accessed
- Provide granular control over features

## Questions?

- Open an issue for questions
- Tag as "question" label
- We're here to help!

## Code of Conduct

Be respectful, inclusive, and professional. We want RemoteFlow to be a welcoming community for all contributors.

---

Thank you for contributing to RemoteFlow! 🚀
