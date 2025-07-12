# Contributing to ASCIIGround

## Commit message format

This project follows [Conventional Commits](https://conventionalcommits.org/) specification. All commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```bash
feat: add wave pattern animation
fix: resolve memory leak in canvas cleanup
docs: update installation instructions
style: fix linting issues in src/index.ts
refactor: simplify noise generation algorithm
test: add unit tests for pattern switching
chore: update dependencies to latest versions
```

### Breaking changes

For breaking changes, add `!` after the type/scope and include `BREAKING CHANGE:` in the footer:

```bash
feat!: change pattern API signature

BREAKING CHANGE: Pattern constructor now requires options object instead of individual parameters
```

## Using commitizen

To help create properly formatted commits, you can use commitizen:

```bash
npm run commit
```

This will guide you through creating a conventional commit message.

## Development workflow

1. Make your changes
2. Run tests: `npm run test:run`
3. Build the library: `npm run build`
4. Commit using: `npm run commit`
5. Create a pull request

## Release process

Releases are automated via GitHub Actions. To create a new release:

1. Go to the repository's Actions tab
2. Run the "Version bump and release" workflow
3. Choose the appropriate version bump type (patch/minor/major)

This will:
- Run all tests
- Bump the version
- Generate a changelog
- Create a GitHub release
- Publish to NPM
- Deploy to CDN
