# ASCIIGround publishing & automation setup

This document explains how to set up automated publishing to NPM and CDN for the ASCIIGround library.

## Prerequisites

1. **GitHub repository**: Ensure your code is hosted on GitHub
2. **NPM account**: Create an account at [npmjs.com](https://npmjs.com)
3. **Node.js**: Version 18.x or higher

## Initial setup

### 1. Repository configuration

1. **Enable GitHub pages**:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"

2. **Add repository secrets**:
   Go to repository Settings → Secrets and variables → Actions and add:
   
   ```
   NPM_TOKEN: your_npm_publish_token
   PAT_TOKEN: your_github_personal_access_token
   ```
   
   To get your NPM token:
   - Go to [npmjs.com](https://npmjs.com) → Account → Access Tokens
   - Create "Automation" token with "Publish" permissions

   To get your GitHub Personal Access Token (PAT):
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Create token with `Contents: write` and `Actions: write` permissions
   - This is required for the release workflow to trigger the CI/CD pipeline

### 2. Local development setup

```bash
# Clone and setup the project
git clone https://github.com/Eoic/asciiground.git
cd asciiground

# Run setup script
./scripts/setup.sh

# Or manually:
npm install
npm run build
npm run test:run
```

## Publishing workflow

### Automated publishing (recommended)

1. **Use GitHub Actions workflow**:
   - Go to repository Actions tab
   - Run "Version Bump and Release" workflow
   - Choose version type (patch/minor/major)
   - This will automatically:
     - Run tests
     - Bump version
     - Create GitHub release
     - Publish to NPM
     - Deploy to CDN

2. **Manual publishing**:
   ```bash
   # Publish patch version (0.7.3 → 0.7.4)
   npm run publish:patch
   
   # Publish minor version (0.7.3 → 0.8.0)
   npm run publish:minor
   
   # Publish major version (0.7.3 → 1.0.0)
   npm run publish:major
   ```

### Release process flow

1. **Code changes** → Push to `main` branch
2. **CI pipeline** → Automatically runs tests, linting, type checking
3. **Version bump** → Manual trigger or script execution
4. **Release creation** → GitHub release with build artifacts
5. **NPM publication** → Automatic publishing to npm registry
6. **CDN deployment** → Files deployed to GitHub Pages CDN
7. **Documentation update** → Automatic docs site update

## CDN access

After publishing, your library will be available via CDN:

### Latest version
```html
<script src="https://Eoic.github.io/asciiground/releases/latest/asciiground.umd.js"></script>
```

### Specific version
```html
<script src="https://Eoic.github.io/asciiground/releases/v1.0.0/asciiground.umd.js"></script>
```

### Alternative CDNs
```html
<!-- unpkg -->
<script src="https://unpkg.com/asciiground@latest/dist/asciiground.umd.js"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/asciiground@latest/dist/asciiground.umd.js"></script>
```

## Development commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build library
npm run test            # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Quality assurance
npm run typecheck       # TypeScript type checking
npm run lint            # ESLint checking
npm run lint:fix        # Auto-fix ESLint issues

# Publishing
npm run publish:patch   # Publish patch version
npm run publish:minor   # Publish minor version  
npm run publish:major   # Publish major version

# Utilities
npm run clean           # Clean dist and coverage
npm run version:check   # Check outdated packages
npm run setup           # Initial development setup
```

## CI/CD pipeline details

### Triggers
- **Push to main**: Runs tests and builds
- **Pull request**: Runs full test suite
- **Release published**: Triggers NPM publish and CDN deploy
- **Manual workflow**: Version bump and release creation

### Build matrix
- Tests run on Node.js 18.x, 20.x, 22.x
- Cross-platform testing (Ubuntu)
- Coverage reporting to Codecov

### Security
- NPM token stored securely in GitHub Secrets
- No sensitive data in repository
- Automated security scanning (dependabot)

## Monitoring and maintenance

### Package health
- **NPM**: https://www.npmjs.com/package/asciiground
- **Bundle size**: Tracked in CI pipeline
- **Test coverage**: Reported to Codecov
- **Type safety**: Enforced via TypeScript

### Documentation
- **API docs**: Auto-generated from JSDoc comments
- **Examples**: Live demos deployed to GitHub Pages
- **README**: Automatically updated with version info

## Troubleshooting

### Common issues

1. **NPM publish fails**:
   - Check NPM_TOKEN secret is set correctly
   - Verify package name is available
   - Ensure version hasn't been published before

2. **CDN deploy fails**:
   - Check GitHub Pages is enabled
   - Verify repository permissions
   - Check build artifacts exist

3. **Tests fail**:
   - Run locally: `npm run test:run`
   - Check test coverage: `npm run test:coverage`
   - Review failing test output in CI

### Debug commands
```bash
# Check build output
npm run build && ls -la dist/

# Verify package contents
npm pack && tar -tf asciiground-*.tgz

# Test installation locally
npm install . && node -e "console.log(require('./package.json').version)"
```

## Next steps

1. **Setup monitoring**: Add badges to README for build status, coverage, etc.
2. **Add dependabot**: Automated dependency updates
3. **Setup codecov**: Code coverage tracking
4. **Create examples**: More comprehensive demo applications
5. **Documentation**: Enhanced API documentation with examples
